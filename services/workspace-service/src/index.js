import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";

import connectDB from "./config/database.js";
import workspaceRoutes from "./routes/workspace.routes.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3008;
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

app.get("/workspace/health", (req, res) => {
  res.json({
    ok: true,
    service: "workspace-service",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/workspaces", workspaceRoutes);

connectDB();

app.listen(PORT, () => {
  console.log(`Workspace-service corriendo en http://localhost:${PORT}`);
});