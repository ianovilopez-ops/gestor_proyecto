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
      enum: ["Propietario", "Administrador", "Miembro", "owner", "admin", "member"],
      default: "Miembro",
    },
  },
  {
    _id: false,
  }
);

const workspaceSchema = new mongoose.Schema(
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
    ownerId: {
      type: String,
      required: true,
    },
    ownerName: {
      type: String,
      default: "Usuario",
    },
    ownerEmail: {
      type: String,
      default: "",
    },
    members: {
      type: [memberSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ["Activo", "Archivado", "active", "archived"],
      default: "Activo",
    },
  },
  {
    timestamps: true,
  }
);

const Workspace = mongoose.model("Workspace", workspaceSchema);

export default Workspace;