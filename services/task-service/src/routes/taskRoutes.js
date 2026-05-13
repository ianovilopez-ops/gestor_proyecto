import { Router } from "express";

import {
  createTask,
  deleteTask,
  getTaskById,
  getTasksByBoard,
  updateTask,
  updateTaskStatus,
} from "../controllers/taskController.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "task-service",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

router.post("/", createTask);
router.get("/board/:boardId", getTasksByBoard);
router.get("/:id", getTaskById);
router.put("/:id", updateTask);
router.patch("/:id/status", updateTaskStatus);
router.delete("/:id", deleteTask);

export default router;