import { io } from "socket.io-client";

const REALTIME_URL =
  import.meta.env.VITE_REALTIME_URL || "http://localhost:3005";

let socket = null;

export function getRealtimeSocket() {
  if (!socket) {
    socket = io(REALTIME_URL, {
      autoConnect: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("[SOCKET] Conectado:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("[SOCKET] Desconectado:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("[SOCKET] Error de conexión:", error.message);
    });
  }

  return socket;
}

export function disconnectRealtimeSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
