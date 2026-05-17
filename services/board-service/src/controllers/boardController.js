import { Board } from "../models/Board.js";

function getUserFromRequest(req) {
  return {
    id: req.headers["x-user-id"] || "dev-user",
    name: req.headers["x-user-name"] || "Usuario Dev",
    email: req.headers["x-user-email"] || "dev@nexusflow.local",
    role: req.headers["x-user-role"] || "Propietario",
  };
}

export async function createBoard(req, res) {
  try {
    const user = getUserFromRequest(req);
    const { name, description, area, status, workspaceId } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        ok: false,
        message: "El nombre del tablero es obligatorio.",
      });
    }

    const board = await Board.create({
      name: name.trim(),
      description: description?.trim() || "",
      area: area?.trim() || "General",
      status: status || "Pendiente",
      workspaceId: workspaceId || "",
      ownerId: user.id,
      createdBy: user.email,
      members: [
        {
          userId: user.id,
          name: user.name,
          email: user.email,
          role: user.role || "Propietario",
        },
      ],
      columns: [
        { id: "pending", title: "Pendiente", order: 1 },
        { id: "in_progress", title: "En proceso", order: 2 },
        { id: "done", title: "Hecho", order: 3 },
      ],
    });

    return res.status(201).json({
      ok: true,
      message: "Tablero creado correctamente.",
      board,
    });
  } catch (error) {
    console.error("Error en createBoard:", error);
    return res.status(500).json({
      ok: false,
      message: "Error interno al crear tablero.",
    });
  }
}

export async function getBoards(req, res) {
  try {
    const user = getUserFromRequest(req);
    const { workspaceId } = req.query;

    const filter = {
      $or: [{ ownerId: user.id }, { "members.userId": user.id }],
    };

    if (workspaceId) {
      filter.workspaceId = workspaceId;
    }

    const boards = await Board.find(filter).sort({ createdAt: -1 });

    return res.json({
      ok: true,
      boards,
    });
  } catch (error) {
    console.error("Error en getBoards:", error);
    return res.status(500).json({
      ok: false,
      message: "Error interno al obtener tableros.",
    });
  }
}

export async function getBoardById(req, res) {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({
        ok: false,
        message: "Tablero no encontrado.",
      });
    }

    return res.json({ ok: true, board });
  } catch (error) {
    console.error("Error en getBoardById:", error);
    return res.status(500).json({
      ok: false,
      message: "Error interno al obtener tablero.",
    });
  }
}

export async function updateBoard(req, res) {
  try {
    const { name, description, area, status, workspaceId } = req.body;

    const board = await Board.findByIdAndUpdate(
      req.params.id,
      {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(area !== undefined && { area }),
        ...(status !== undefined && { status }),
        ...(workspaceId !== undefined && { workspaceId }),
      },
      { new: true, runValidators: true }
    );

    if (!board) {
      return res.status(404).json({
        ok: false,
        message: "Tablero no encontrado.",
      });
    }

    return res.json({
      ok: true,
      message: "Tablero actualizado correctamente.",
      board,
    });
  } catch (error) {
    console.error("Error en updateBoard:", error);
    return res.status(500).json({
      ok: false,
      message: "Error interno al actualizar tablero.",
    });
  }
}

export async function deleteBoard(req, res) {
  try {
    const board = await Board.findByIdAndDelete(req.params.id);

    if (!board) {
      return res.status(404).json({
        ok: false,
        message: "Tablero no encontrado.",
      });
    }

    return res.json({
      ok: true,
      message: "Tablero eliminado correctamente.",
    });
  } catch (error) {
    console.error("Error en deleteBoard:", error);
    return res.status(500).json({
      ok: false,
      message: "Error interno al eliminar tablero.",
    });
  }
}

export async function addBoardMember(req, res) {
  try {
    const { userId, name, email, role } = req.body;

    if (!userId || !email) {
      return res.status(400).json({
        ok: false,
        message: "El usuario y correo son obligatorios.",
      });
    }

    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({
        ok: false,
        message: "Tablero no encontrado.",
      });
    }

    const alreadyExists = board.members.some(
      (member) => member.userId === userId || member.email === email
    );

    if (alreadyExists) {
      return res.status(409).json({
        ok: false,
        message: "El usuario ya pertenece a este tablero.",
      });
    }

    board.members.push({
      userId,
      name: name || "Usuario",
      email,
      role: role || "Miembro",
    });

    await board.save();

    return res.json({
      ok: true,
      message: "Miembro agregado correctamente.",
      board,
    });
  } catch (error) {
    console.error("Error en addBoardMember:", error);
    return res.status(500).json({
      ok: false,
      message: "Error interno al agregar miembro.",
    });
  }
}

export async function removeBoardMember(req, res) {
  try {
    const { userId } = req.params;

    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({
        ok: false,
        message: "Tablero no encontrado.",
      });
    }

    board.members = board.members.filter((member) => member.userId !== userId);

    await board.save();

    return res.json({
      ok: true,
      message: "Miembro eliminado correctamente.",
      board,
    });
  } catch (error) {
    console.error("Error en removeBoardMember:", error);
    return res.status(500).json({
      ok: false,
      message: "Error interno al eliminar miembro.",
    });
  }
}

