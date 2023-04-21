import Chat from "../models/chat";
import User from "../models/user";

export const createMessage = async (req, res) => {
  const { message, image } = req.body;

  if (!message.length) {
    return res.json({
      error: "message is required.",
    });
  }

  try {
    const chat = new Chat({
      message,
      image,
      sendBy: req.auth._id,
    });

    await chat.save();

    const messageWithUser = await Chat.findById(chat._id)
    .populate("sendBy", "-password -secret")

    res.json(messageWithUser);
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
};


export const allMessages = async (req, res) => {
  try {
    const messages = await Chat.find()
    .populate("sendBy", "_id name image")

    res.json(messages);
  } catch (err) {
    console.log(err);
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const message = await Chat.findByIdAndDelete(req.params._id);

    message.image &&
      message.image.public_id &&
      (await cloudinary.v2.uploader.destroy(post.image.public_id));
    res.json({ ok: true });
  } catch (err) {
    console.log(err);
  }
};

export const likeMessage = async (req, res) => {
  try {
    const chat = await Chat.findByIdAndUpdate(
      req.body._id,
      {
        $addToSet: { likes: req.auth._id },
      },
      { new: true }
    );

    res.json(chat);
  } catch (err) {
    console.log(err);
  }
};

export const unlikeMessage = async (req, res) => {
  try {
    const chat = await Chat.findByIdAndUpdate(
      req.body._id,
      {
        $pull: { likes: req.auth._id },
      },
      { new: true }
    );

    res.json(chat);
  } catch (err) {
    console.log(err);
  }
};