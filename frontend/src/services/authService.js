const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function request(endpoint, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      signal: controller.signal,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error en la petición.");
    }

    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("El servidor tardó demasiado en responder.");
    }

    throw new Error(error.message || "No se pudo conectar con el servidor.");
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function loginUser({ email, password }) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });
}

export async function registerUser({ name, email, password, role }) {
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

export async function changePassword({ currentPassword, newPassword }) {
  const token = getToken();

  return request("/api/auth/change-password", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      currentPassword,
      newPassword,
    }),
  });
}

export function saveSession({ token, user }) {
  localStorage.setItem("nexusflow_token", token);
  localStorage.setItem("nexusflow_user", JSON.stringify(user));
}

export function getToken() {
  return localStorage.getItem("nexusflow_token");
}

export function getCurrentUser() {
  const user = localStorage.getItem("nexusflow_user");

  if (!user) return null;

  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
}

export function logoutUser() {
  localStorage.removeItem("nexusflow_token");
  localStorage.removeItem("nexusflow_user");
}