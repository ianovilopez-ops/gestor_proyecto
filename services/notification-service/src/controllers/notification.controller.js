import { io } from "socket.io-client";
import { Notification } from "../models/Notification.js";

const REALTIME_SERVICE_URL =
  process.env.REALTIME_SERVICE_URL || "http://localhost:3005";

const socket = io(REALTIME_SERVICE_URL, {
  autoConnect: true,
  reconnection: true,
});

function getUserId(req) {
  return req.headers["x-user-id"] || "dev-user";
}

function emitNotificationEvent(eventName, payload) {
  try {
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit(eventName, payload);
  } catch (error) {
    console.error("Error emitiendo evento realtime:", error.message);
  }
}

export async function getNotifications(req, res) {
  try {
    const userId = getUserId(req);

    const notifications = await Notification.find({ userId }).sort({
      createdAt: -1,
    });

    const unreadCount = notifications.filter(
      (notification) => !notification.read
    ).length;

    return res.json({
      ok: true,
      unreadCount,
      notifications,
    });
  } catch (error) {
    console.error("Error obteniendo notificaciones:", error);

    return res.status(500).json({
      ok: false,
      message: "Error obteniendo notificaciones.",
      error: error.message,
    });
  }
}

export async function createNotification(req, res) {
  try {
    const userId = req.body.userId || getUserId(req);

    const {
      title,
      message,
      type,
      relatedId,
      relatedType,
      priority,
      dedupeKey,
      metadata,
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        ok: false,
        message: "Título y mensaje son obligatorios.",
      });
    }

    if (dedupeKey) {
      const existingNotification = await Notification.findOne({
        userId,
        dedupeKey,
      });

      if (existingNotification) {
        return res.json({
          ok: true,
          message: "Notificación ya existente.",
          notification: existingNotification,
        });
      }
    }

    const notification = await Notification.create({
      userId,
      title,
      message,
      type: type || "system",
      relatedId: relatedId || "",
      relatedType: relatedType || "",
      metadata: metadata || {},
      priority: priority || "Media",
      dedupeKey: dedupeKey || "",
    });

    emitNotificationEvent("notification-created", {
      userId,
      notification,
    });

    return res.status(201).json({
      ok: true,
      message: "Notificación creada correctamente.",
      notification,
    });
  } catch (error) {
    console.error("Error creando notificación:", error);

    return res.status(500).json({
      ok: false,
      message: "Error creando notificación.",
      error: error.message,
    });
  }
}

export async function markAsRead(req, res) {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        ok: false,
        message: "Notificación no encontrada.",
      });
    }

    emitNotificationEvent("notification-read", {
      userId: notification.userId,
      notificationId: notification._id,
    });

    return res.json({
      ok: true,
      message: "Notificación marcada como leída.",
      notification,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error actualizando notificación.",
      error: error.message,
    });
  }
}

export async function markAllAsRead(req, res) {
  try {
    const userId = getUserId(req);

    await Notification.updateMany({ userId, read: false }, { read: true });

    emitNotificationEvent("notifications-read-all", {
      userId,
    });

    return res.json({
      ok: true,
      message: "Todas las notificaciones fueron marcadas como leídas.",
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error actualizando notificaciones.",
      error: error.message,
    });
  }
}

export async function deleteNotification(req, res) {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
      return res.status(404).json({
        ok: false,
        message: "Notificación no encontrada.",
      });
    }

    emitNotificationEvent("notification-deleted", {
      userId: notification.userId,
      notificationId: notification._id,
    });

    return res.json({
      ok: true,
      message: "Notificación eliminada correctamente.",
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error eliminando notificación.",
      error: error.message,
    });
  }
}