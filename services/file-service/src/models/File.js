const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    filename: {
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
    url: {
      type: String,
      default: "",
    },
    uploadedBy: {
      userId: {
        type: String,
        default: "dev-user",
      },
      name: {
        type: String,
        default: "Usuario",
      },
      email: {
        type: String,
        default: "",
      },
    },
    relatedType: {
      type: String,
      enum: ["general", "workspace", "board", "task", "message"],
      default: "general",
    },
    relatedId: {
      type: String,
      default: "",
    },
    visibility: {
      type: String,
      enum: ["public", "private", "team"],
      default: "team",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("File", fileSchema);