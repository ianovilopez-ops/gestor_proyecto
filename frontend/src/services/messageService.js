import axios from "axios";
import { getToken } from "./authService";

const API_URL = "http://localhost:3000/api/messages";

function getAuthHeaders() {
  const token = getToken();

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

const messageService = {
  async getConversations() {
    const response = await axios.get(
      `${API_URL}/conversations`,
      getAuthHeaders()
    );

    return response.data;
  },

  async getMessages(userId) {
    const response = await axios.get(`${API_URL}/${userId}`, getAuthHeaders());

    return response.data;
  },

  async sendMessage(receiver, content) {
    const receiverId = receiver?._id || receiver?.id || receiver?.receiverId;
    const receiverName =
      receiver?.name || receiver?.receiverName || receiver?.email || "Usuario";
    const receiverEmail =
      receiver?.email || receiver?.receiverEmail || "sin-correo@nexusflow.local";

    const response = await axios.post(
      API_URL,
      {
        receiverId,
        receiverName,
        receiverEmail,
        content,
      },
      getAuthHeaders()
    );

    return response.data;
  },

  async markAsRead(messageId) {
    const response = await axios.patch(
      `${API_URL}/${messageId}/read`,
      {},
      getAuthHeaders()
    );

    return response.data;
  },

  async deleteMessage(messageId) {
    const response = await axios.delete(
      `${API_URL}/${messageId}`,
      getAuthHeaders()
    );

    return response.data;
  },
};

export default messageService;