import express from "express";

import {
  getNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "notification-service",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

router.get("/", getNotifications);
router.post("/", createNotification);
router.patch("/read-all", markAllAsRead);
router.patch("/:id/read", markAsRead);
router.delete("/:id", deleteNotification);

export default router;