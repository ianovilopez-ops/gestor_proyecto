import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        "task",
        "message",
        "workspace",
        "board",
        "file",
        "system",
        "deadline",
      ],
      default: "system",
    },
    relatedId: {
      type: String,
      default: "",
    },
    relatedType: {
      type: String,
      default: "",
    },
    metadata: {
      type: Object,
      default: {},
    },
    dedupeKey: {
      type: String,
      default: "",
      index: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ["Baja", "Media", "Alta"],
      default: "Media",
    },
  },
  {
    timestamps: true,
  }
);

export const Notification = mongoose.model(
  "Notification",
  notificationSchema
);