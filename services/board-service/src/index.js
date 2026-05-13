import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";

import { connectDB } from "./config/db.js";
import boardRoutes from "./routes/boardRoutes.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3002;
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
    service: "NexusFlow Board Service",
    message: "Board Service funcionando correctamente.",
  });
});

app.use("/boards", boardRoutes);
app.use("/", boardRoutes);

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: "Ruta no encontrada en Board Service.",
    path: req.originalUrl,
  });
});

await connectDB();

app.listen(PORT, () => {
  console.log(`Board Service corriendo en http://localhost:${PORT}`);
});