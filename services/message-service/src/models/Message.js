import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: String,
      required: true,
      index: true,
    },
    senderName: {
      type: String,
      required: true,
      trim: true,
    },
    senderEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    receiverId: {
      type: String,
      required: true,
      index: true,
    },
    receiverName: {
      type: String,
      required: true,
      trim: true,
    },
    receiverEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    content: {
      type: String,
      required: [true, "El mensaje no puede estar vacío"],
      trim: true,
      maxlength: [1000, "El mensaje no puede superar 1000 caracteres"],
    },

    boardId: {
      type: String,
      default: "",
      index: true,
    },

    read: {
      type: Boolean,
      default: false,
      index: true,
    },

    deletedBySender: {
      type: Boolean,
      default: false,
    },

    deletedByReceiver: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, senderId: 1, createdAt: -1 });

export const Message = mongoose.model("Message", messageSchema);