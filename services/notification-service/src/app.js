import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";

import notificationRoutes from "./routes/notification.routes.js";

const app = express();

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

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "notification-service",
    status: "healthy",
  });
});

app.use("/notifications", notificationRoutes);

export default app;