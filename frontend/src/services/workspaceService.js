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
    throw new Error(data.message || "Error en workspace service.");
  }

  return data;
}

export async function getWorkspaces() {
  return request("/api/workspaces");
}

export async function getWorkspaceById(workspaceId) {
  return request(`/api/workspaces/${workspaceId}`);
}

export async function createWorkspace(workspaceData) {
  return request("/api/workspaces", {
    method: "POST",
    body: JSON.stringify(workspaceData),
  });
}

export async function updateWorkspace(workspaceId, workspaceData) {
  return request(`/api/workspaces/${workspaceId}`, {
    method: "PUT",
    body: JSON.stringify(workspaceData),
  });
}

export async function deleteWorkspace(workspaceId) {
  return request(`/api/workspaces/${workspaceId}`, {
    method: "DELETE",
  });
}

export async function addWorkspaceMember(workspaceId, memberData) {
  return request(`/api/workspaces/${workspaceId}/members`, {
    method: "PATCH",
    body: JSON.stringify(memberData),
  });
}

export async function removeWorkspaceMember(workspaceId, userId) {
  return request(`/api/workspaces/${workspaceId}/members/${userId}`, {
    method: "DELETE",
  });
}