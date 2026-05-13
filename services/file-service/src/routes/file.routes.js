const express = require("express");
const upload = require("../middlewares/upload.middleware");

const {
  uploadFile,
  getFiles,
  getFilesByProject,
  getFilesByTask,
  getFilesByMessage,
  downloadFile,
  deleteFile,
} = require("../controllers/file.controller");

const router = express.Router();

router.post("/upload", upload.single("file"), uploadFile);

router.get("/", getFiles);
router.get("/project/:projectId", getFilesByProject);
router.get("/task/:taskId", getFilesByTask);
router.get("/message/:messageId", getFilesByMessage);

router.get("/:id/download", downloadFile);
router.delete("/:id", deleteFile);

module.exports = router;