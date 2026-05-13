const multer = require("multer");

const errorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        ok: false,
        message: "El archivo excede el tamaño máximo permitido.",
      });
    }

    return res.status(400).json({
      ok: false,
      message: "Error al procesar el archivo.",
      error: err.message,
    });
  }

  if (err.message === "Tipo de archivo no permitido") {
    return res.status(400).json({
      ok: false,
      message: "Tipo de archivo no permitido.",
    });
  }

  return res.status(500).json({
    ok: false,
    message: "Error interno del servidor.",
    error: err.message,
  });
};

module.exports = errorHandler;