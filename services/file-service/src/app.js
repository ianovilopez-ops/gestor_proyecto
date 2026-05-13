const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const fileRoutes = require("./routes/file.routes");
const errorHandler = require("./middlewares/error.middleware");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "file-service",
    message: "File-service funcionando correctamente",
  });
});

app.use("/uploads", express.static("src/uploads"));

app.use("/api/files", fileRoutes);
app.use(errorHandler);
module.exports = app;