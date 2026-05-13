import mongoose from "mongoose";

const boardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre del tablero es obligatorio"],
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
      enum: ["Pendiente", "En proceso", "Avanzado", "Completado"],
      default: "Pendiente",
    },
    ownerId: {
      type: String,
      required: true,
    },
    createdBy: {
      type: String,
      default: "",
    },
    members: [
      {
        userId: String,
        name: String,
        email: String,
        role: {
          type: String,
          enum: ["Propietario", "Administrador", "Miembro", "Observador"],
          default: "Miembro",
        },
      },
    ],
    columns: [
      {
        id: String,
        title: String,
        order: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Board = mongoose.model("Board", boardSchema);