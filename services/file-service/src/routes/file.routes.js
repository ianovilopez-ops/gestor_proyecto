const express = require("express");
const upload = require("../middlewares/upload.middleware");

const {
  uploadFile,
  getFiles,
  getFileById,
  downloadFile,
  deleteFile,
} = require("../controllers/file.controller");

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "file-service",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

router.post("/upload", upload.single("file"), uploadFile);

router.get("/", getFiles);
router.get("/:id", getFileById);
router.get("/:id/download", downloadFile);
router.delete("/:id", deleteFile);

module.exports = router;