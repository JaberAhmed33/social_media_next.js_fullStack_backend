import Post from "../models/post";
import User from "../models/user";
import cloudinary from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API,
  api_secret: process.env.CLOUDINARY_SECRET,
});

export const createPost = async (req, res) => {
  const { content, image } = req.body;

  if (!content.length) {
    return res.json({
      error: "Content is required.",
    });
  }

  try {
    const post = new Post({
      content,
      image,
      postedBy: req.auth._id,
    });

    await post.save();

    const postWithUser = await Post.findById(post._id)
    .populate("postedBy", "-password -secret")

    res.json(postWithUser);
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
};

export const uploadImage = async (req, res) => {
  try {
    const result = await cloudinary.v2.uploader.upload(req.files.image.path);
    console.log(result);
    res.json({
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (err) {
    console.log(err);
  }
};

export const postsByUser = async (req, res) => {
  try {
    // const post = await Post.find({postedBy: req.auth._id})
    const post = await Post.find()
      .populate("postedBy", "_id name image")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(post);
  } catch (err) {
    console.log(err);
  }
};

export const userPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params._id)
    .populate("postedBy", "_id name image")
    .populate("comments.postedBy", "_id name image");

    res.json(post);
  } catch (err) {
    console.log(err);
  }
};

export const updatePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params._id, req.body, {
      new: true,
    });
    res.json(post);
  } catch (err) {
    console.log(err);
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params._id);

    post.image &&
      post.image.public_id &&
      (await cloudinary.v2.uploader.destroy(post.image.public_id));
    res.json({ ok: true });
  } catch (err) {
    console.log(err);
  }
};

export const newsFeed = async (req, res) => {
  try {
    const user = await User.findById(req.auth._id);

    let following = user.following;
    following.push(user._id);

    const currentPage = req.params.page || 1;
    const perPage = 2;

    const posts = await Post.find({ postedBy: { $in: following } })
      .skip((currentPage - 1 ) * perPage)
      .populate("postedBy", "_id name image username")
      .populate("comments.postedBy", "_id name image username")
      .sort({ createdAt: -1 })
      .limit(perPage);

    res.json(posts);
  } catch (err) {
    console.log(err);
  }
};

export const likePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.body._id,
      {
        $addToSet: { likes: req.auth._id },
      },
      { new: true }
    );

    res.json(post);
  } catch (err) {
    console.log(err);
  }
};

export const unlikePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.body._id,
      {
        $pull: { likes: req.auth._id },
      },
      { new: true }
    );

    res.json(post);
  } catch (err) {
    console.log(err);
  }
};

export const addComment = async (req, res) => {

  try {
    const post = await Post.findByIdAndUpdate(
      req.body.postId,
      {
        $push: { comments: { text: req.body.comment, postedBy: req.auth._id } },
      },
      { new: true }
    )

      .populate("postedBy", "_id name image")
      .populate("comments.postedBy", "_id name image");

    res.json(post);
  } catch (err) {
    console.log(err);
  }
};

export const removeComment = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.body.postId,
      {
        $pull: { comments: { _id: req.body.comment._id } },
      },
      { new: true }
    );

    res.json(post);
  } catch (err) {
    console.log(err);
  }
};


export const totalPosts = async (req, res) => {
  try {
    const total = await Post.find().estimatedDocumentCount();

    res.json(total);
  } catch (err) {
    console.log(err);
  }
};

export const posts = async (req, res) => {
  try {
    const posts = await Post.find()
    .populate("postedBy", "_id name image username")
    .populate("comments.postedBy", "_id name image username")
    .sort({createdAt: -1})
    .limit(12);

    res.json(posts);
  } catch (err) {
    console.log(err);
  }
};
