import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    boardId: {
      type: String,
      required: [true, "El ID del tablero es obligatorio"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "El título de la tarea es obligatorio"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "done"],
      default: "pending",
      index: true,
    },
    priority: {
      type: String,
      enum: ["Alta", "Media", "Baja"],
      default: "Media",
    },
    dueDate: {
      type: String,
      default: "Sin fecha",
    },
    assignedTo: {
      userId: {
        type: String,
        default: "",
      },
      name: {
        type: String,
        default: "",
      },
      email: {
        type: String,
        default: "",
      },
      initials: {
        type: String,
        default: "U",
      },
    },
    ownerId: {
      type: String,
      required: true,
    },
    createdBy: {
      type: String,
      default: "",
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    filesCount: {
      type: Number,
      default: 0,
    },
    position: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Task = mongoose.model("Task", taskSchema);