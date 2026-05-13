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

export async function getUsers(search = "") {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";

  return request(`/api/users${query}`, {
    method: "GET",
  });
}

export async function getUserById(userId) {
  return request(`/api/users/${userId}`, {
    method: "GET",
  });
}

export async function createUser({ name, email, password, role }) {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password,
      role,
    }),
  });
}
