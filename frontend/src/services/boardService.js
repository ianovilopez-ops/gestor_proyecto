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

export async function getBoards() {
  return request("/api/boards", {
    method: "GET",
  });
}

export async function createBoard({ name, description, area, status }) {
  return request("/api/boards", {
    method: "POST",
    body: JSON.stringify({
      name,
      description,
      area,
      status,
    }),
  });
}

export async function getBoardById(boardId) {
  return request(`/api/boards/${boardId}`, {
    method: "GET",
  });
}

export async function updateBoard(boardId, data) {
  return request(`/api/boards/${boardId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteBoard(boardId) {
  return request(`/api/boards/${boardId}`, {
    method: "DELETE",
  });
}

export async function addBoardMember(boardId, member) {
  return request(`/api/boards/${boardId}/members`, {
    method: "PATCH",
    body: JSON.stringify(member),
  });
}

export async function removeBoardMember(boardId, userId) {
  return request(`/api/boards/${boardId}/members/${userId}`, {
    method: "DELETE",
  });
}
