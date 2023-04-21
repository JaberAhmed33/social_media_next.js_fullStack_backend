import User from "../models/user";
import { hashPassword, comparePassword } from "../helpers/auth";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";

export const register = async (req, res) => {
  const { name, password, email, secret } = req.body;

  if (!name) {
    return res.status(400).send("Name is required");
  }

  if (!password || password.length < 7) {
    return res
      .status(400)
      .send("Password is required and should be 7 characters or longer");
  }

  if (!secret) {
    return res.status(400).send("Answer is required");
  }

  if (!email) {
    return res.status(400).send("Email is required");
  }

  const exist = await User.findOne({ email });

  if (exist) {
    return res.status(400).send("Email is taken");
  }

  const hashedPassword = await hashPassword(password);

  const user = new User({
    name,
    password: hashedPassword,
    email,
    secret,
    username: nanoid(7),
  });

  try {
    await user.save();
    console.log("Register use  =>", user);

    return res.json({
      ok: true,
      message: "Register is Done",
    });
  } catch (err) {
    console.log("Register is Failed  =>", err);
    res.status(400).send("Error. Try again.");
  }
};

export const login = async (req, res) => {
  try {
    // await user.save();
    // console.log("Register use  =>", user);

    // return res.json({
    //     ok: true,
    //     message: "Register is Done"
    // })

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).send("No user found!.");
    const match = await comparePassword(password, user.password);
    if (!match) return res.status(400).send("Wrong password!.");
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    user.password = undefined;
    user.secret = undefined;
    res.json({
      token,
      user,
    });
  } catch (err) {
    console.log("Login is Failed  =>", err);
    res.status(400).send("Error. Try again.");
  }
};

export const forgotPassword = async (req, res) => {
  const { email, newPassword, secret } = req.body;

  if (!newPassword || newPassword.length < 7) {
    return res.json({
      error: "Password is required and should be 7 characters or longer",
    });
  }

  if (!secret) {
    return res.json({
      error: "Secret is required",
    });
  }

  if (!email) {
    return res.json({
      error: "Email is required",
    });
  }

  const user = await User.findOne({ email, secret });

  if (!user) {
    return res.json({
      error: "we can not verfiy you with those details",
    });
  }

  try {
    const hashed = await hashPassword(newPassword);
    await User.findByIdAndUpdate(user._id, { password: hashed });

    return res.json({
      success: "No you can login with new password :)",
    });
  } catch (err) {
    console.log(err);
    res.json({ error: "Something wrong. try again." });
  }
};

export const currentUser = async (req, res) => {
  try {
    await User.findById(req.auth._id);

    res.send({
      ok: true,
    });
  } catch (err) {
    console.log(err);
    res.status(401);
  }
};

export const profileUpdate = async (req, res) => {
  const { name, username, password, secret, about, image } = req.body;

  try {
    const data = {};

    if (username) {
      data.username = username;
    }

    if (about) {
      data.about = about;
    }

    if (name) {
      data.name = name;
    }

    if (password) {
      if (password.length < 7) {
        return res.json({
          error: "Password is required and should be 7 characters or longer",
        });
      } else {
        data.password = await hashPassword(password);
      }
    }

    if (secret) {
      data.secret = secret;
    }

    if (image) {
      data.image = image;
    }

    let user = await User.findByIdAndUpdate(req.auth._id, data, {
      new: true,
    });


    user.password = undefined;
    user.secret = undefined;

    res.json(user);
  } catch (err) {
    if (err.code == 11000) {
      return res.json({ error: "Duplicate username" });
    }
    console.log(err);
  }
};

export const findPeople = async (req, res) => {
  try {
    const user = await User.findById(req.auth._id);

    let following = user.following;

    following.push(user._id);

    // const user = await User.findByIdAndUpdate(req.auth._id, {
    //   $addToSet: {following: req.auth._id}
    // },
    // {new: true}
    // );

    const people = await User.find({_id: {$nin: following}})
    .select("-password -secret")
    .limit(10);

    res.send(people);
  } catch (err) {
    console.log(err);
  }
};

//middleware
export const addFollower = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.body._id, {
      $addToSet: {followers: req.auth._id}
    });
    next();
  } catch (err) {
    console.log(err);
  }
};


export const userFollow = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.auth._id, {
      $addToSet: {following: req.body._id}
    },
    {new: true}
    ).select("-password -secret");
    res.json(user);
  } catch (err) {
    console.log(err);
  }
};

export const userFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.auth._id);

    const following = await User.find({_id: user.following})
    .select("-password -secret")
    .limit(100);

    res.json(following);
  } catch (err) {
    console.log(err);
  }
};


//middleware
export const removeFollower = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.body._id, {
      $pull: {followers: req.auth._id}
    });
    next();
  } catch (err) {
    console.log(err);
  }
};

export const userUnfollow = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.auth._id, {
      $pull: {following: req.body._id}
    },
    {new: true}
    ).select("-password -secret");
    res.json(user);
  } catch (err) {
    console.log(err);
  }
};

export const searchUser = async (req, res) => {

  const {query} = req.params;
  if(!query) return;

  try {
    const user = await User.find({
      $or: [
        {name: {$regex: query, $options: "i"}},
        {username: {$regex: query, $options: "i"}}
      ]
    }).select("-password -secret");
    res.json(user);
  } catch (err) {
    console.log(err);
  }
};

export const getUser = async (req, res) => {

  try {
    const user = await User.findOne({username: req.params.username})
    .select("-password -secret");

    res.json(user);
  } catch (err) {
    console.log(err);
  }
};