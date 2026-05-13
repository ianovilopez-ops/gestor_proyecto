const mongoose = require("mongoose");
const File = require("../models/File");

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        ok: false,
        message: "No se recibió ningún archivo",
      });
    }

    const {
      uploadedBy = "dev-user",
      projectId = null,
      taskId = null,
      messageId = null,
      visibility = "private",
    } = req.body;

    const fileData = {
      originalName: req.file.originalname,
      fileName: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      uploadedBy,
      projectId,
      taskId,
      messageId,
      visibility,
    };

    if (mongoose.connection.readyState !== 1) {
      return res.status(201).json({
        ok: true,
        mode: "dev-without-mongo",
        message: "Archivo subido localmente. Metadata no guardada porque MongoDB no está conectado.",
        file: fileData,
      });
    }

    const file = await File.create(fileData);

    res.status(201).json({
      ok: true,
      message: "Archivo subido correctamente",
      file,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al subir archivo",
      error: error.message,
    });
  }
};

const getFiles = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        ok: true,
        mode: "dev-without-mongo",
        message: "MongoDB no está conectado. No se pueden listar archivos desde BD.",
        files: [],
      });
    }

    const files = await File.find().sort({ createdAt: -1 });

    res.json({
      ok: true,
      files,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener archivos",
      error: error.message,
    });
  }
};

const getFilesByProject = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        ok: true,
        mode: "dev-without-mongo",
        message: "MongoDB no está conectado. No se pueden listar archivos por proyecto.",
        files: [],
      });
    }

    const files = await File.find({
      projectId: req.params.projectId,
    }).sort({ createdAt: -1 });

    res.json({
      ok: true,
      files,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener archivos del proyecto",
      error: error.message,
    });
  }
};

const getFilesByTask = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        ok: true,
        mode: "dev-without-mongo",
        message: "MongoDB no está conectado. No se pueden listar archivos por tarea.",
        files: [],
      });
    }

    const files = await File.find({
      taskId: req.params.taskId,
    }).sort({ createdAt: -1 });

    res.json({
      ok: true,
      files,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener archivos de la tarea",
      error: error.message,
    });
  }
};

const getFilesByMessage = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        ok: true,
        mode: "dev-without-mongo",
        message: "MongoDB no está conectado. No se pueden listar archivos por mensaje.",
        files: [],
      });
    }

    const files = await File.find({
      messageId: req.params.messageId,
    }).sort({ createdAt: -1 });

    res.json({
      ok: true,
      files,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener archivos del mensaje",
      error: error.message,
    });
  }
};

const downloadFile = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        ok: false,
        mode: "dev-without-mongo",
        message: "MongoDB no está conectado. No se puede buscar el archivo por ID.",
      });
    }

    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        ok: false,
        message: "Archivo no encontrado",
      });
    }

    res.download(file.path, file.originalName);
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al descargar archivo",
      error: error.message,
    });
  }
};

const deleteFile = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        ok: false,
        mode: "dev-without-mongo",
        message: "MongoDB no está conectado. No se puede eliminar archivo por ID.",
      });
    }

    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        ok: false,
        message: "Archivo no encontrado",
      });
    }

    const fsExtra = require("fs-extra");

    await fsExtra.remove(file.path);
    await File.findByIdAndDelete(req.params.id);

    res.json({
      ok: true,
      message: "Archivo eliminado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al eliminar archivo",
      error: error.message,
    });
  }

  const getFilesByProject = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        ok: true,
        mode: "dev-without-mongo",
        message: "MongoDB no está conectado. No se pueden listar archivos por proyecto.",
        files: [],
      });
    }

    const files = await File.find({
      projectId: req.params.projectId,
    }).sort({ createdAt: -1 });

    res.json({
      ok: true,
      files,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener archivos del proyecto",
      error: error.message,
    });
  }
};

const getFilesByTask = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        ok: true,
        mode: "dev-without-mongo",
        message: "MongoDB no está conectado. No se pueden listar archivos por tarea.",
        files: [],
      });
    }

    const files = await File.find({
      taskId: req.params.taskId,
    }).sort({ createdAt: -1 });

    res.json({
      ok: true,
      files,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener archivos de la tarea",
      error: error.message,
    });
  }
};

const getFilesByMessage = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        ok: true,
        mode: "dev-without-mongo",
        message: "MongoDB no está conectado. No se pueden listar archivos por mensaje.",
        files: [],
      });
    }

    const files = await File.find({
      messageId: req.params.messageId,
    }).sort({ createdAt: -1 });

    res.json({
      ok: true,
      files,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener archivos del mensaje",
      error: error.message,
    });
  }
};
};

module.exports = {
  uploadFile,
  getFiles,
  downloadFile,
  deleteFile,
  getFilesByProject,
  getFilesByTask,
  getFilesByMessage
};