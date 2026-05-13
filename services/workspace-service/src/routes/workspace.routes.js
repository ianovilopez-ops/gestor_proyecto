const express = require("express");

const {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  addMemberToWorkspace,
  updateMemberRole,
  removeMemberFromWorkspace,
} = require("../controllers/workspace.controller");

const router = express.Router();

router.post("/", createWorkspace);
router.get("/", getWorkspaces);
router.get("/:id", getWorkspaceById);
router.put("/:id", updateWorkspace);
router.delete("/:id", deleteWorkspace);
router.post("/:id/members", addMemberToWorkspace);
router.patch("/:id/members/:memberUserId/role", updateMemberRole);
router.delete("/:id/members/:memberUserId", removeMemberFromWorkspace);

module.exports = router;