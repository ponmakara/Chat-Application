import { Router } from "express";
import {
  getCurrentUser,
  getUsers,
  updateCurrentUser,
  uploadCurrentUserAvatar
} from "./user.controller.js";
import { protect } from "../../middleware/auth.middleware.js";
import { avatarUpload } from "../../middleware/upload.middleware.js";

const router = Router();

router.get("/me", protect, getCurrentUser);
router.post("/me/avatar", protect, avatarUpload.single("avatar"), uploadCurrentUserAvatar);
router.put("/me", protect, updateCurrentUser);
router.get("/", protect, getUsers);

export default router;
