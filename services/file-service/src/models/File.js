const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: String,
      required: true,
    },
    projectId: {
      type: String,
      default: null,
    },
    taskId: {
      type: String,
      default: null,
    },
    messageId: {
      type: String,
      default: null,
    },
    visibility: {
      type: String,
      enum: ["project", "task", "message", "private"],
      default: "private",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("File", fileSchema);