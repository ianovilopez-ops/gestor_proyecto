import { Router } from "express";

import {
  deleteMessage,
  getConversation,
  getConversations,
  markMessageAsRead,
  sendMessage,
} from "../controllers/messageController.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "message-service",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

router.get("/conversations", getConversations);
router.get("/:userId", getConversation);
router.post("/", sendMessage);
router.patch("/:messageId/read", markMessageAsRead);
router.delete("/:messageId", deleteMessage);

export default router;