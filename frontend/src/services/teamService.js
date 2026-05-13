import axios from "axios";

const API_URL = "http://localhost:3000/api";

function getAuthHeaders() {
  const token =
    localStorage.getItem("token") || localStorage.getItem("nexusflow_token");

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