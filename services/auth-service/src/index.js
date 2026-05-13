import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3001;
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

app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "NexusFlow Auth Service",
    message: "Auth Service funcionando correctamente.",
  });
});

/*
  Acepta ambas formas:

  Directo:
  http://localhost:3001/auth/health

  Si el gateway reenvía sin /auth:
  http://localhost:3001/health
*/
app.use("/auth", authRoutes);
app.use("/", authRoutes);

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: "Ruta no encontrada en Auth Service.",
    path: req.originalUrl,
  });
});

await connectDB();

app.listen(PORT, () => {
  console.log(`Auth Service corriendo en http://localhost:${PORT}`);
});