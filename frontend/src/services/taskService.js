import { getToken } from "./authService.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function request(endpoint, options = {}) {
  const token = getToken();

  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && {
        Authorization: `Bearer ${token}`,
      }),
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error en la petición.");
  }

  return data;
}

export async function getTasksByBoard(boardId) {
  return request(`/api/tasks/board/${boardId}`, {
    method: "GET",
  });
}

export async function createTask(data) {
  return request("/api/tasks", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getTaskById(taskId) {
  return request(`/api/tasks/${taskId}`, {
    method: "GET",
  });
}

export async function updateTask(taskId, data) {
  return request(`/api/tasks/${taskId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function updateTaskStatus(taskId, data) {
  return request(`/api/tasks/${taskId}/status`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteTask(taskId) {
  return request(`/api/tasks/${taskId}`, {
    method: "DELETE",
  });
}
