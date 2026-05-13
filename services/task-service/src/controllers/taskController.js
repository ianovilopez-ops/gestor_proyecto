import { Task } from "../models/Task.js";

function getUserFromRequest(req) {
  return {
    id: req.headers["x-user-id"] || "dev-user",
    name: req.headers["x-user-name"] || "Usuario Dev",
    email: req.headers["x-user-email"] || "dev@nexusflow.local",
    role: req.headers["x-user-role"] || "Propietario",
  };
}

function getInitials(nameOrEmail = "U") {
  return nameOrEmail
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export async function createTask(req, res) {
  try {
    const user = getUserFromRequest(req);

    const {
      boardId,
      title,
      description,
      status,
      priority,
      dueDate,
      assignedTo,
      position,
    } = req.body;

    if (!boardId) {
      return res.status(400).json({
        ok: false,
        message: "El ID del tablero es obligatorio.",
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        ok: false,
        message: "El título de la tarea es obligatorio.",
      });
    }

    const assigneeName = assignedTo?.name || user.name || "Usuario";
    const assigneeEmail = assignedTo?.email || user.email || "";

    const task = await Task.create({
      boardId,
      title: title.trim(),
      description: description?.trim() || "",
      status: status || "pending",
      priority: priority || "Media",
      dueDate: dueDate || "Sin fecha",
      assignedTo: {
        userId: assignedTo?.userId || user.id,
        name: assigneeName,
        email: assigneeEmail,
        initials: assignedTo?.initials || getInitials(assigneeName || assigneeEmail),
      },
      ownerId: user.id,
      createdBy: user.email,
      position: Number(position || 0),
    });

    return res.status(201).json({
      ok: true,
      message: "Tarea creada correctamente.",
      task,
    });
  } catch (error) {
    console.error("Error en createTask:", error);

    return res.status(500).json({
      ok: false,
      message: "Error interno al crear tarea.",
    });
  }
}

export async function getTasksByBoard(req, res) {
  try {
    const { boardId } = req.params;

    const tasks = await Task.find({ boardId }).sort({
      status: 1,
      position: 1,
      createdAt: -1,
    });

    return res.json({
      ok: true,
      tasks,
    });
  } catch (error) {
    console.error("Error en getTasksByBoard:", error);

    return res.status(500).json({
      ok: false,
      message: "Error interno al obtener tareas.",
    });
  }
}

export async function getTaskById(req, res) {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        ok: false,
        message: "Tarea no encontrada.",
      });
    }

    return res.json({
      ok: true,
      task,
    });
  } catch (error) {
    console.error("Error en getTaskById:", error);

    return res.status(500).json({
      ok: false,
      message: "Error interno al obtener tarea.",
    });
  }
}

export async function updateTask(req, res) {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      status,
      priority,
      dueDate,
      assignedTo,
      position,
    } = req.body;

    const updateData = {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(status !== undefined && { status }),
      ...(priority !== undefined && { priority }),
      ...(dueDate !== undefined && { dueDate }),
      ...(position !== undefined && { position }),
      ...(assignedTo !== undefined && { assignedTo }),
    };

    const task = await Task.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!task) {
      return res.status(404).json({
        ok: false,
        message: "Tarea no encontrada.",
      });
    }

    return res.json({
      ok: true,
      message: "Tarea actualizada correctamente.",
      task,
    });
  } catch (error) {
    console.error("Error en updateTask:", error);

    return res.status(500).json({
      ok: false,
      message: "Error interno al actualizar tarea.",
    });
  }
}

export async function updateTaskStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, position } = req.body;

    if (!["pending", "in_progress", "done"].includes(status)) {
      return res.status(400).json({
        ok: false,
        message: "Estado de tarea inválido.",
      });
    }

    const task = await Task.findByIdAndUpdate(
      id,
      {
        status,
        ...(position !== undefined && { position }),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!task) {
      return res.status(404).json({
        ok: false,
        message: "Tarea no encontrada.",
      });
    }

    return res.json({
      ok: true,
      message: "Estado de tarea actualizado correctamente.",
      task,
    });
  } catch (error) {
    console.error("Error en updateTaskStatus:", error);

    return res.status(500).json({
      ok: false,
      message: "Error interno al mover tarea.",
    });
  }
}

export async function deleteTask(req, res) {
  try {
    const { id } = req.params;

    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      return res.status(404).json({
        ok: false,
        message: "Tarea no encontrada.",
      });
    }

    return res.json({
      ok: true,
      message: "Tarea eliminada correctamente.",
    });
  } catch (error) {
    console.error("Error en deleteTask:", error);

    return res.status(500).json({
      ok: false,
      message: "Error interno al eliminar tarea.",
    });
  }
}