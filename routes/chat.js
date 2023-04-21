import express from "express";
import { requireSignin, canEditDeleteMessage, isAdmin } from "../middlewares/auth";
import {
  createMessage,
  allMessages,
//   uploadImage,
//   postsByUser,
//   userPost,
//   updatePost,
  deleteMessage,
  likeMessage,
  unlikeMessage,
} from "./../controllers/chat";
import ExpressFormidable from "express-formidable";

const router = express.Router();

router.post("/create-message", requireSignin, createMessage);
// router.post(
//   "/upload-image",
//   requireSignin,
//   ExpressFormidable({ maxFieldsSize: 5 * 1024 * 1024 }),
//   uploadImage
// );

router.get("/all-messages", requireSignin, allMessages);
// router.get("/user-post/:_id", requireSignin, userPost);
// router.put("/update-post/:_id", requireSignin, canEditDeletePost, updatePost);
router.delete(
  "/delete-message/:_id",
  requireSignin,
  canEditDeleteMessage,
  deleteMessage
);
router.put("/like-message", requireSignin, likeMessage);
router.put("/unlike-message", requireSignin, unlikeMessage);

module.exports = router;
