import express from "express";
import {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  addWorkspaceMember,
  removeWorkspaceMember,
} from "../controllers/workspace.controller.js";

const router = express.Router();

router.get("/", getWorkspaces);
router.post("/", createWorkspace);
router.get("/:id", getWorkspaceById);
router.put("/:id", updateWorkspace);
router.delete("/:id", deleteWorkspace);

router.patch("/:id/members", addWorkspaceMember);
router.delete("/:id/members/:userId", removeWorkspaceMember);

export default router;