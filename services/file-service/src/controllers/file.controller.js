const path = require("path");
const fs = require("fs");
const File = require("../models/File");

function buildFileUrl(req, filename) {
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  return `${baseUrl}/uploads/${filename}`;
}

async function uploadFile(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        ok: false,
        message: "No se recibió ningún archivo.",
      });
    }

    const userId = req.headers["x-user-id"] || "dev-user";
    const userName = req.headers["x-user-name"] || "Usuario";
    const userEmail = req.headers["x-user-email"] || "";

    const fileUrl = buildFileUrl(req, req.file.filename);

    const file = await File.create({
      originalName: req.file.originalname,
      filename: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      url: fileUrl,
      uploadedBy: {
        userId,
        name: userName,
        email: userEmail,
      },
      relatedType: req.body.relatedType || "general",
      relatedId: req.body.relatedId || "",
    });

    return res.status(201).json({
      ok: true,
      message: "Archivo subido correctamente.",
      file,
    });
  } catch (error) {
    console.error("Error subiendo archivo:", error);

    return res.status(500).json({
      ok: false,
      message: "Error interno al subir archivo.",
      error: error.message,
    });
  }
}

async function getFiles(req, res) {
  try {
    const { relatedType, relatedId } = req.query;

    const filter = {};

    if (relatedType) filter.relatedType = relatedType;
    if (relatedId) filter.relatedId = relatedId;

    const files = await File.find(filter).sort({ createdAt: -1 });

    return res.json({
      ok: true,
      files,
    });
  } catch (error) {
    console.error("Error obteniendo archivos:", error);

    return res.status(500).json({
      ok: false,
      message: "Error interno al obtener archivos.",
      error: error.message,
    });
  }
}

async function getFileById(req, res) {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        ok: false,
        message: "Archivo no encontrado.",
      });
    }

    return res.json({
      ok: true,
      file,
    });
  } catch (error) {
    console.error("Error obteniendo archivo:", error);

    return res.status(500).json({
      ok: false,
      message: "Error interno al obtener archivo.",
      error: error.message,
    });
  }
}

async function downloadFile(req, res) {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        ok: false,
        message: "Archivo no encontrado.",
      });
    }

    const filePath = path.resolve(file.path);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        ok: false,
        message: "El archivo físico no existe en el servidor.",
      });
    }

    return res.download(filePath, file.originalName);
  } catch (error) {
    console.error("Error descargando archivo:", error);

    return res.status(500).json({
      ok: false,
      message: "Error interno al descargar archivo.",
      error: error.message,
    });
  }
}

async function deleteFile(req, res) {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        ok: false,
        message: "Archivo no encontrado.",
      });
    }

    if (file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    await File.findByIdAndDelete(req.params.id);

    return res.json({
      ok: true,
      message: "Archivo eliminado correctamente.",
    });
  } catch (error) {
    console.error("Error eliminando archivo:", error);

    return res.status(500).json({
      ok: false,
      message: "Error interno al eliminar archivo.",
      error: error.message,
    });
  }
}

module.exports = {
  uploadFile,
  getFiles,
  getFileById,
  downloadFile,
  deleteFile,
};