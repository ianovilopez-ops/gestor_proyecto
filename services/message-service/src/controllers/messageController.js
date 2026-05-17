import { Message } from "../models/Message.js";

const NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3007";

function getUserFromRequest(req) {
  return {
    id: req.headers["x-user-id"] || "",
    name: req.headers["x-user-name"] || "Usuario",
    email: req.headers["x-user-email"] || "usuario@nexusflow.local",
    role: req.headers["x-user-role"] || "Miembro",
  };
}

function buildConversationKey(userA, userB) {
  return [userA, userB].sort().join(":");
}

async function createNotification(payload) {
  try {
    await fetch(`${NOTIFICATION_SERVICE_URL}/notifications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": payload.userId || "dev-user",
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("Error enviando notificación de mensaje:", error.message);
  }
}

export async function sendMessage(req, res) {
  try {
    const sender = getUserFromRequest(req);

    const {
      receiverId,
      receiverName,
      receiverEmail,
      content,
      boardId = "",
    } = req.body;

    if (!sender.id) {
      return res.status(401).json({
        ok: false,
        message: "Usuario emisor no identificado.",
      });
    }

    if (!receiverId || !receiverName || !receiverEmail) {
      return res.status(400).json({
        ok: false,
        message: "Datos del receptor incompletos.",
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        ok: false,
        message: "El mensaje no puede estar vacío.",
      });
    }

    if (sender.id === receiverId) {
      return res.status(400).json({
        ok: false,
        message: "No puedes enviarte mensajes a ti mismo.",
      });
    }

    const message = await Message.create({
      senderId: sender.id,
      senderName: sender.name,
      senderEmail: sender.email,

      receiverId,
      receiverName,
      receiverEmail,

      content: content.trim(),
      boardId,
      read: false,
    });

    await createNotification({
      userId: receiverId,
      title: `Nuevo mensaje de ${sender.name}`,
      message: content.trim().slice(0, 120),
      type: "message",
      relatedId: message._id.toString(),
      relatedType: "message",
      priority: "Media",
      dedupeKey: `${message._id}-message-received`,
      metadata: {
        senderId: sender.id,
        senderName: sender.name,
        boardId,
        messageId: message._id.toString(),
      },
    });

    return res.status(201).json({
      ok: true,
      message: "Mensaje enviado correctamente.",
      data: message,
    });
  } catch (error) {
    console.error("Error en sendMessage:", error);

    return res.status(500).json({
      ok: false,
      message: "Error interno al enviar mensaje.",
    });
  }
}

export async function getConversation(req, res) {
  try {
    const user = getUserFromRequest(req);
    const { userId } = req.params;

    if (!user.id) {
      return res.status(401).json({
        ok: false,
        message: "Usuario no identificado.",
      });
    }

    const messages = await Message.find({
      $or: [
        {
          senderId: user.id,
          receiverId: userId,
          deletedBySender: false,
        },
        {
          senderId: userId,
          receiverId: user.id,
          deletedByReceiver: false,
        },
      ],
    }).sort({ createdAt: 1 });

    await Message.updateMany(
      {
        senderId: userId,
        receiverId: user.id,
        read: false,
      },
      {
        read: true,
      }
    );

    return res.json({
      ok: true,
      messages,
    });
  } catch (error) {
    console.error("Error en getConversation:", error);

    return res.status(500).json({
      ok: false,
      message: "Error interno al obtener conversación.",
    });
  }
}

export async function getConversations(req, res) {
  try {
    const user = getUserFromRequest(req);

    if (!user.id) {
      return res.status(401).json({
        ok: false,
        message: "Usuario no identificado.",
      });
    }

    const messages = await Message.find({
      $or: [
        {
          senderId: user.id,
          deletedBySender: false,
        },
        {
          receiverId: user.id,
          deletedByReceiver: false,
        },
      ],
    }).sort({ createdAt: -1 });

    const conversationMap = new Map();

    for (const message of messages) {
      const otherUser =
        message.senderId === user.id
          ? {
              id: message.receiverId,
              name: message.receiverName,
              email: message.receiverEmail,
            }
          : {
              id: message.senderId,
              name: message.senderName,
              email: message.senderEmail,
            };

      const key = buildConversationKey(user.id, otherUser.id);

      if (!conversationMap.has(key)) {
        const unreadCount = messages.filter(
          (item) =>
            item.senderId === otherUser.id &&
            item.receiverId === user.id &&
            item.read === false
        ).length;

        conversationMap.set(key, {
          user: otherUser,
          lastMessage: message,
          unreadCount,
        });
      }
    }

    return res.json({
      ok: true,
      conversations: Array.from(conversationMap.values()),
    });
  } catch (error) {
    console.error("Error en getConversations:", error);

    return res.status(500).json({
      ok: false,
      message: "Error interno al obtener conversaciones.",
    });
  }
}

export async function markMessageAsRead(req, res) {
  try {
    const user = getUserFromRequest(req);
    const { messageId } = req.params;

    const message = await Message.findOneAndUpdate(
      {
        _id: messageId,
        receiverId: user.id,
      },
      {
        read: true,
      },
      {
        new: true,
      }
    );

    if (!message) {
      return res.status(404).json({
        ok: false,
        message: "Mensaje no encontrado.",
      });
    }

    return res.json({
      ok: true,
      message: "Mensaje marcado como leído.",
      data: message,
    });
  } catch (error) {
    console.error("Error en markMessageAsRead:", error);

    return res.status(500).json({
      ok: false,
      message: "Error interno al marcar mensaje como leído.",
    });
  }
}

export async function deleteMessage(req, res) {
  try {
    const user = getUserFromRequest(req);
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        ok: false,
        message: "Mensaje no encontrado.",
      });
    }

    if (message.senderId === user.id) {
      message.deletedBySender = true;
    } else if (message.receiverId === user.id) {
      message.deletedByReceiver = true;
    } else {
      return res.status(403).json({
        ok: false,
        message: "No tienes permiso para eliminar este mensaje.",
      });
    }

    await message.save();

    return res.json({
      ok: true,
      message: "Mensaje eliminado correctamente.",
    });
  } catch (error) {
    console.error("Error en deleteMessage:", error);

    return res.status(500).json({
      ok: false,
      message: "Error interno al eliminar mensaje.",
    });
  }
}