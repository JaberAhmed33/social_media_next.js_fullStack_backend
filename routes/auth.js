import express from "express";
import {
  register,
  login,
  currentUser,
  forgotPassword,
  profileUpdate,
  findPeople,
  addFollower,
  userFollow,
  userFollowing,
  removeFollower,
  userUnfollow,
  searchUser,
  getUser
} from "../controllers/auth";
import { isAdmin, requireSignin } from "../middlewares/auth";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.get("/current-user", requireSignin, currentUser);
router.put("/profile-update", requireSignin, profileUpdate);
router.get("/find-people", requireSignin, findPeople);
router.put("/user-follow", requireSignin, addFollower, userFollow);
router.put("/user-unfollow", requireSignin, removeFollower, userUnfollow);
router.get("/user-following", requireSignin, userFollowing);
router.get("/search-user/:query", requireSignin, searchUser);
router.get("/user/:username", requireSignin, getUser);
router.get("/current-admin", requireSignin, isAdmin, currentUser);

module.exports = router;
