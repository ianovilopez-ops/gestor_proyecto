import axios from "axios";
import { getToken } from "./authService";

const API_URL = "http://localhost:3000/api";

function getAuthHeaders() {
  const token = getToken();

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

export async function getUsers() {
  const response = await axios.get(`${API_URL}/auth/users`, getAuthHeaders());
  return response.data;
}