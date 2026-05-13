import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import http from "node:http";
import { Server } from "socket.io";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3005;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan("dev"));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "NexusFlow Realtime Service",
    message: "Realtime Service funcionando correctamente.",
  });
});

app.get("/realtime/health", (req, res) => {
  res.json({
    ok: true,
    service: "realtime-service",
    status: "healthy",
    connectedClients: io.engine.clientsCount,
    timestamp: new Date().toISOString(),
  });
});

io.on("connection", (socket) => {
  console.log(`Cliente conectado: ${socket.id}`);

  socket.on("join-board", (boardId) => {
    if (!boardId) return;

    socket.join(`board:${boardId}`);

    console.log(`Cliente ${socket.id} entró al tablero ${boardId}`);

    socket.emit("joined-board", {
      ok: true,
      boardId,
      room: `board:${boardId}`,
    });
  });

  socket.on("leave-board", (boardId) => {
    if (!boardId) return;

    socket.leave(`board:${boardId}`);

    console.log(`Cliente ${socket.id} salió del tablero ${boardId}`);
  });

  socket.on("task-created", ({ boardId, task }) => {
    if (!boardId || !task) return;

    socket.to(`board:${boardId}`).emit("task-created", {
      boardId,
      task,
    });
  });

  socket.on("task-updated", ({ boardId, task }) => {
    if (!boardId || !task) return;

    socket.to(`board:${boardId}`).emit("task-updated", {
      boardId,
      task,
    });
  });

  socket.on("task-moved", ({ boardId, task }) => {
    if (!boardId || !task) return;

    socket.to(`board:${boardId}`).emit("task-moved", {
      boardId,
      task,
    });
  });

  socket.on("task-deleted", ({ boardId, taskId }) => {
    if (!boardId || !taskId) return;

    socket.to(`board:${boardId}`).emit("task-deleted", {
      boardId,
      taskId,
    });
  });

  socket.on("disconnect", () => {
    console.log(`Cliente desconectado: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Realtime Service corriendo en http://localhost:${PORT}`);
  console.log(`Socket.io listo para conexiones desde ${FRONTEND_URL}`);
});
