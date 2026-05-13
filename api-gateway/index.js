import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const AUTH_SERVICE_URL =
  process.env.AUTH_SERVICE_URL || "http://localhost:3001";

const BOARD_SERVICE_URL =
  process.env.BOARD_SERVICE_URL || "http://localhost:3002";

const TASK_SERVICE_URL =
  process.env.TASK_SERVICE_URL || "http://localhost:3003";

const FILE_SERVICE_URL =
  process.env.FILE_SERVICE_URL || "http://localhost:3004";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

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

app.use(morgan("dev"));
app.use(express.json());

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      ok: false,
      message: "No se envió token de autorización.",
    });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    req.headers["x-user-id"] = decoded.id;
    req.headers["x-user-name"] = decoded.name || "";
    req.headers["x-user-email"] = decoded.email || "";
    req.headers["x-user-role"] = decoded.role || "";

    return next();
  } catch {
    return res.status(401).json({
      ok: false,
      message: "Token inválido o expirado.",
    });
  }
}

async function forwardRequest(req, res, targetUrl) {
  try {
    console.log(`[FORWARD] ${req.method} ${req.originalUrl} -> ${targetUrl}`);

    const headers = {
      "Content-Type": "application/json",
    };

    if (req.headers.authorization) {
      headers.Authorization = req.headers.authorization;
    }

    if (req.headers["x-user-id"]) {
      headers["x-user-id"] = req.headers["x-user-id"];
    }

    if (req.headers["x-user-name"]) {
      headers["x-user-name"] = req.headers["x-user-name"];
    }

    if (req.headers["x-user-email"]) {
      headers["x-user-email"] = req.headers["x-user-email"];
    }

    if (req.headers["x-user-role"]) {
      headers["x-user-role"] = req.headers["x-user-role"];
    }

    const options = {
      method: req.method,
      headers,
    };

    if (!["GET", "HEAD"].includes(req.method)) {
      options.body = JSON.stringify(req.body || {});
    }

    const response = await fetch(targetUrl, options);
    const contentType = response.headers.get("content-type") || "";

    res.status(response.status);

    if (contentType.includes("application/json")) {
      const data = await response.json();
      return res.json(data);
    }

    const text = await response.text();
    return res.send(text);
  } catch (error) {
    console.error("Error en forward:", error.message);

    return res.status(502).json({
      ok: false,
      message: "Servicio no disponible.",
      error: error.message,
    });
  }
}

app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "NexusFlow API Gateway",
    message: "API Gateway funcionando correctamente.",
  });
});

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "api-gateway",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

/*
  AUTH SERVICE
*/

app.get("/api/auth/health", (req, res) => {
  return forwardRequest(req, res, `${AUTH_SERVICE_URL}/auth/health`);
});

app.post("/api/auth/register", (req, res) => {
  return forwardRequest(req, res, `${AUTH_SERVICE_URL}/auth/register`);
});

app.post("/api/auth/login", (req, res) => {
  return forwardRequest(req, res, `${AUTH_SERVICE_URL}/auth/login`);
});

app.get("/api/auth/me", authMiddleware, (req, res) => {
  return forwardRequest(req, res, `${AUTH_SERVICE_URL}/auth/me`);
});

/*
  BOARD SERVICE
*/

app.get("/api/boards/health", (req, res) => {
  return forwardRequest(req, res, `${BOARD_SERVICE_URL}/boards/health`);
});

app.post("/api/boards", authMiddleware, (req, res) => {
  return forwardRequest(req, res, `${BOARD_SERVICE_URL}/boards`);
});

app.get("/api/boards", authMiddleware, (req, res) => {
  return forwardRequest(req, res, `${BOARD_SERVICE_URL}/boards`);
});

app.get("/api/boards/:id", authMiddleware, (req, res) => {
  return forwardRequest(
    req,
    res,
    `${BOARD_SERVICE_URL}/boards/${req.params.id}`
  );
});

app.put("/api/boards/:id", authMiddleware, (req, res) => {
  return forwardRequest(
    req,
    res,
    `${BOARD_SERVICE_URL}/boards/${req.params.id}`
  );
});

app.delete("/api/boards/:id", authMiddleware, (req, res) => {
  return forwardRequest(
    req,
    res,
    `${BOARD_SERVICE_URL}/boards/${req.params.id}`
  );
});

/*
  TASK SERVICE - pendiente
*/

app.get("/api/tasks/health", (req, res) => {
  return forwardRequest(req, res, `${TASK_SERVICE_URL}/tasks/health`);
});

/*
  FILE SERVICE - pendiente
*/

app.get("/api/files/health", (req, res) => {
  return forwardRequest(req, res, `${FILE_SERVICE_URL}/files/health`);
});

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: "Ruta no encontrada en API Gateway.",
    path: req.originalUrl,
  });
});

app.use((error, req, res, next) => {
  console.error("Error en API Gateway:", error);

  res.status(500).json({
    ok: false,
    message: "Error interno en API Gateway.",
  });
});

app.listen(PORT, () => {
  console.log(`API Gateway corriendo en http://localhost:${PORT}`);
  console.log(`Frontend permitido: ${FRONTEND_URL}`);
});