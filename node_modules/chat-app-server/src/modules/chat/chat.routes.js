import { Router } from "express";
import { deleteMessage, getConversations, getMessages, sendMessage } from "./chat.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = Router();

router.get("/conversations", protect, getConversations);
router.get("/messages/:userId", protect, getMessages);
router.post("/messages/:userId", protect, sendMessage);
router.delete("/messages/item/:messageId", protect, deleteMessage);

export default router;
