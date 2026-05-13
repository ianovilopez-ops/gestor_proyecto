const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const workspaceRoutes = require("./routes/workspace.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "workspace-service",
    message: "Workspace-service funcionando correctamente",
  });
});

app.use("/api/workspaces", workspaceRoutes);

module.exports = app;