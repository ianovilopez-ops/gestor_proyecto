import { Router } from "express";

import {
  addBoardMember,
  createBoard,
  deleteBoard,
  getBoardById,
  getBoards,
  removeBoardMember,
  updateBoard,
} from "../controllers/boardController.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "board-service",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

router.post("/", createBoard);
router.get("/", getBoards);

router.patch("/:id/members", addBoardMember);
router.delete("/:id/members/:userId", removeBoardMember);

router.get("/:id", getBoardById);
router.put("/:id", updateBoard);
router.delete("/:id", deleteBoard);

export default router;