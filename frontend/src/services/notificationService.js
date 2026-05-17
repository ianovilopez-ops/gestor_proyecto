import { getToken } from "./authService.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function request(endpoint, options = {}) {
  const token = getToken();

  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error en notificaciones.");
  }

  return data;
}

export async function getNotifications() {
  return request("/api/notifications");
}

export async function createNotification(data) {
  return request("/api/notifications", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function markNotificationAsRead(id) {
  return request(`/api/notifications/${id}/read`, {
    method: "PATCH",
  });
}

export async function markAllNotificationsAsRead() {
  return request("/api/notifications/read-all", {
    method: "PATCH",
  });
}

export async function deleteNotification(id) {
  return request(`/api/notifications/${id}`, {
    method: "DELETE",
  });
}