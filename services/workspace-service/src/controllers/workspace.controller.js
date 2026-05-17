import Workspace from "../models/Workspace.js";

function getUser(req) {
  return {
    id: req.headers["x-user-id"],
    name: req.headers["x-user-name"] || "Usuario",
    email: req.headers["x-user-email"] || "",
  };
}

function findMember(workspace, user) {
  return workspace.members.find(
    (member) =>
      String(member.userId) === String(user.id) ||
      String(member.email).toLowerCase() ===
        String(user.email).toLowerCase()
  );
}

function isOwner(workspace, user) {
  return (
    String(workspace.ownerId) === String(user.id) ||
    String(workspace.ownerEmail).toLowerCase() ===
      String(user.email).toLowerCase()
  );
}

function isAdmin(workspace, user) {
  if (isOwner(workspace, user)) return true;

  const member = findMember(workspace, user);

  if (!member) return false;

  return (
    member.role === "admin" ||
    member.role === "Administrador"
  );
}

function canAccess(workspace, user) {
  if (isOwner(workspace, user)) return true;

  return workspace.members.some(
    (member) =>
      String(member.userId) === String(user.id) ||
      String(member.email).toLowerCase() ===
        String(user.email).toLowerCase()
  );
}

export async function getWorkspaces(req, res) {
  try {
    const user = getUser(req);

    const workspaces = await Workspace.find({
      $or: [
        { ownerId: user.id },
        { ownerEmail: user.email },
        { "members.userId": user.id },
        { "members.email": user.email },
      ],
    }).sort({ createdAt: -1 });

    res.json({
      ok: true,
      workspaces,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error obteniendo workspaces.",
      error: error.message,
    });
  }
}

export async function getWorkspaceById(req, res) {
  try {
    const user = getUser(req);

    const workspace = await Workspace.findById(req.params.id);

    if (!workspace || !canAccess(workspace, user)) {
      return res.status(404).json({
        ok: false,
        message: "Workspace no encontrado o sin acceso.",
      });
    }

    res.json({
      ok: true,
      workspace,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error obteniendo workspace.",
      error: error.message,
    });
  }
}

export async function createWorkspace(req, res) {
  try {
    const user = getUser(req);

    const { name, description } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        ok: false,
        message: "El nombre del workspace es obligatorio.",
      });
    }

    const workspace = await Workspace.create({
      name: name.trim(),
      description: description?.trim() || "",
      ownerId: user.id,
      ownerName: user.name,
      ownerEmail: user.email,
      members: [
        {
          userId: user.id,
          name: user.name,
          email: user.email,
          role: "owner",
        },
      ],
    });

    res.status(201).json({
      ok: true,
      message: "Workspace creado correctamente.",
      workspace,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error creando workspace.",
      error: error.message,
    });
  }
}

export async function updateWorkspace(req, res) {
  try {
    const user = getUser(req);

    const workspace = await Workspace.findById(req.params.id);

    if (!workspace || !isAdmin(workspace, user)) {
      return res.status(403).json({
        ok: false,
        message: "No tienes permisos para editar este workspace.",
      });
    }

    const { name, description } = req.body;

    if (name !== undefined) {
      workspace.name = name;
    }

    if (description !== undefined) {
      workspace.description = description;
    }

    await workspace.save();

    res.json({
      ok: true,
      message: "Workspace actualizado correctamente.",
      workspace,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error actualizando workspace.",
      error: error.message,
    });
  }
}

export async function deleteWorkspace(req, res) {
  try {
    const user = getUser(req);

    const workspace = await Workspace.findById(req.params.id);

    if (!workspace || !isOwner(workspace, user)) {
      return res.status(403).json({
        ok: false,
        message: "Solo el owner puede eliminar el workspace.",
      });
    }

    await workspace.deleteOne();

    res.json({
      ok: true,
      message: "Workspace eliminado correctamente.",
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error eliminando workspace.",
      error: error.message,
    });
  }
}

export async function addWorkspaceMember(req, res) {
  try {
    const user = getUser(req);

    const workspace = await Workspace.findById(req.params.id);

    if (!workspace || !isAdmin(workspace, user)) {
      return res.status(403).json({
        ok: false,
        message: "No tienes permisos para agregar miembros.",
      });
    }

    const { userId, name, email, role } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        ok: false,
        message: "Nombre y correo obligatorios.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const alreadyExists = workspace.members.some(
      (member) =>
        String(member.email).toLowerCase() === normalizedEmail
    );

    if (alreadyExists) {
      return res.status(400).json({
        ok: false,
        message: "El usuario ya pertenece al workspace.",
      });
    }

    workspace.members.push({
      userId: userId || normalizedEmail,
      name,
      email: normalizedEmail,
      role: role || "member",
    });

    await workspace.save();

    res.json({
      ok: true,
      message: "Miembro agregado correctamente.",
      workspace,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error agregando miembro.",
      error: error.message,
    });
  }
}

export async function removeWorkspaceMember(req, res) {
  try {
    const user = getUser(req);

    const workspace = await Workspace.findById(req.params.id);

    if (!workspace || !isOwner(workspace, user)) {
      return res.status(403).json({
        ok: false,
        message: "Solo el owner puede eliminar miembros.",
      });
    }

    workspace.members = workspace.members.filter(
      (member) =>
        String(member.userId) !== String(req.params.userId) &&
        String(member.email) !== String(req.params.userId)
    );

    await workspace.save();

    res.json({
      ok: true,
      message: "Miembro eliminado correctamente.",
      workspace,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error eliminando miembro.",
      error: error.message,
    });
  }
}