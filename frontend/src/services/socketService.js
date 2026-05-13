import { io } from "socket.io-client";
import { getToken } from "./authService";

const SOCKET_URL = "http://localhost:3005";

let socket = null;

export function connectSocket() {
  if (socket) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: {
      token: getToken(),
    },
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.log("Socket conectado:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("Socket desconectado");
  });

  socket.on("connect_error", (error) => {
    console.error("Error Socket.io:", error.message);
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}