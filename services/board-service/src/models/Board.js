import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      default: "Usuario",
    },
    email: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      default: "Miembro",
    },
  },
  {
    _id: false,
  }
);

const columnSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      default: 1,
    },
  },
  {
    _id: false,
  }
);

const boardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    area: {
      type: String,
      default: "General",
      trim: true,
    },
    status: {
      type: String,
      default: "Pendiente",
    },
    workspaceId: {
      type: String,
      default: "",
      index: true,
    },
    ownerId: {
      type: String,
      required: true,
    },
    createdBy: {
      type: String,
      default: "",
    },
    members: {
      type: [memberSchema],
      default: [],
    },
    columns: {
      type: [columnSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Board = mongoose.model("Board", boardSchema);