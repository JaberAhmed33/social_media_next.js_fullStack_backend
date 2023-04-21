import express from "express";
import { requireSignin, canEditDeletePost, isAdmin } from "../middlewares/auth";
import {
  createPost,
  uploadImage,
  postsByUser,
  userPost,
  updatePost,
  deletePost,
  newsFeed,
  likePost,
  unlikePost,
  addComment,
  removeComment,
  totalPosts,
  posts,
} from "./../controllers/post";
import ExpressFormidable from "express-formidable";

const router = express.Router();

router.post("/create-post", requireSignin, createPost);
router.post(
  "/upload-image",
  requireSignin,
  ExpressFormidable({ maxFieldsSize: 5 * 1024 * 1024 }),
  uploadImage
);

router.get("/user-posts", requireSignin, postsByUser);
router.get("/user-post/:_id", requireSignin, userPost);
router.put("/update-post/:_id", requireSignin, canEditDeletePost, updatePost);
router.delete(
  "/delete-post/:_id",
  requireSignin,
  canEditDeletePost,
  deletePost
);
router.get("/news-feed/:page", requireSignin, newsFeed);
router.put("/like-post", requireSignin, likePost);
router.put("/unlike-post", requireSignin, unlikePost);
router.put("/add-comment", requireSignin, addComment);
router.put("/remove-comment", requireSignin, removeComment);
router.get("/total-posts", totalPosts);
router.get("/posts", posts);

//admin
router.delete(
  "/admin/delete-post/:_id",
  requireSignin,
  isAdmin,
  deletePost
);
router.put("/admin/remove-comment", requireSignin, isAdmin, removeComment);

module.exports = router;
