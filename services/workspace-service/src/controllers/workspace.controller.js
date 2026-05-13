const mongoose = require("mongoose");
const Workspace = require("../models/Workspace");

const createWorkspace = async (req, res) => {
  try {
    const {
      name,
      description = "",
      ownerId = "dev-user",
      ownerName = "",
      ownerEmail = "",
    } = req.body;

    if (!name) {
      return res.status(400).json({
        ok: false,
        message: "El nombre del workspace es obligatorio.",
      });
    }

    const workspaceData = {
      name,
      description,
      ownerId,
      members: [
        {
          userId: ownerId,
          name: ownerName,
          email: ownerEmail,
          role: "owner",
          status: "active",
        },
      ],
    };

    if (mongoose.connection.readyState !== 1) {
      return res.status(201).json({
        ok: true,
        mode: "dev-without-mongo",
        message: "Workspace simulado. MongoDB no está conectado.",
        workspace: workspaceData,
      });
    }

    const workspace = await Workspace.create(workspaceData);

    res.status(201).json({
      ok: true,
      message: "Workspace creado correctamente.",
      workspace,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al crear workspace.",
      error: error.message,
    });
  }
};

const getWorkspaces = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        ok: true,
        mode: "dev-without-mongo",
        message: "MongoDB no está conectado. No se pueden listar workspaces.",
        workspaces: [],
      });
    }

    const workspaces = await Workspace.find({ isActive: true }).sort({
      createdAt: -1,
    });

    res.json({
      ok: true,
      workspaces,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener workspaces.",
      error: error.message,
    });
  }
};

const getWorkspaceById = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        ok: true,
        mode: "dev-without-mongo",
        message: "MongoDB no está conectado. No se puede obtener workspace por ID.",
        workspace: null,
      });
    }

    const workspace = await Workspace.findById(req.params.id);

    if (!workspace || !workspace.isActive) {
      return res.status(404).json({
        ok: false,
        message: "Workspace no encontrado.",
      });
    }

    res.json({
      ok: true,
      workspace,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener workspace.",
      error: error.message,
    });
  }
};

const updateWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (mongoose.connection.readyState !== 1) {
      return res.json({
        ok: true,
        mode: "dev-without-mongo",
        message: "Workspace simulado actualizado. MongoDB no está conectado.",
        workspace: {
          id: req.params.id,
          name,
          description,
        },
      });
    }

    const workspace = await Workspace.findByIdAndUpdate(
      req.params.id,
      {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!workspace || !workspace.isActive) {
      return res.status(404).json({
        ok: false,
        message: "Workspace no encontrado.",
      });
    }

    res.json({
      ok: true,
      message: "Workspace actualizado correctamente.",
      workspace,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al actualizar workspace.",
      error: error.message,
    });
  }
};

const deleteWorkspace = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        ok: true,
        mode: "dev-without-mongo",
        message: "Workspace simulado eliminado. MongoDB no está conectado.",
        workspaceId: req.params.id,
      });
    }

    const workspace = await Workspace.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!workspace) {
      return res.status(404).json({
        ok: false,
        message: "Workspace no encontrado.",
      });
    }

    res.json({
      ok: true,
      message: "Workspace eliminado correctamente.",
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al eliminar workspace.",
      error: error.message,
    });
  }
};

const addMemberToWorkspace = async (req, res) => {
  try {
    const { userId, name = "", email = "", role = "member" } = req.body;

    if (!userId) {
      return res.status(400).json({
        ok: false,
        message: "El userId del miembro es obligatorio.",
      });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(201).json({
        ok: true,
        mode: "dev-without-mongo",
        message: "Miembro simulado agregado. MongoDB no está conectado.",
        member: {
          userId,
          name,
          email,
          role,
          status: "active",
        },
      });
    }

    const workspace = await Workspace.findById(req.params.id);

    if (!workspace || !workspace.isActive) {
      return res.status(404).json({
        ok: false,
        message: "Workspace no encontrado.",
      });
    }

    const alreadyMember = workspace.members.some(
      (member) => member.userId === userId && member.status !== "removed"
    );

    if (alreadyMember) {
      return res.status(400).json({
        ok: false,
        message: "El usuario ya pertenece a este workspace.",
      });
    }

    workspace.members.push({
      userId,
      name,
      email,
      role,
      status: "active",
    });

    await workspace.save();

    res.status(201).json({
      ok: true,
      message: "Miembro agregado correctamente.",
      workspace,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al agregar miembro.",
      error: error.message,
    });
  }
};

const updateMemberRole = async (req, res) => {
  try {
    const { memberUserId } = req.params;
    const { role } = req.body;

    const validRoles = ["owner", "admin", "member", "viewer"];

    if (!validRoles.includes(role)) {
      return res.status(400).json({
        ok: false,
        message: "Rol no válido.",
      });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.json({
        ok: true,
        mode: "dev-without-mongo",
        message: "Rol de miembro simulado actualizado. MongoDB no está conectado.",
        member: {
          userId: memberUserId,
          role,
        },
      });
    }

    const workspace = await Workspace.findById(req.params.id);

    if (!workspace || !workspace.isActive) {
      return res.status(404).json({
        ok: false,
        message: "Workspace no encontrado.",
      });
    }

    const member = workspace.members.find(
      (member) => member.userId === memberUserId && member.status !== "removed"
    );

    if (!member) {
      return res.status(404).json({
        ok: false,
        message: "Miembro no encontrado.",
      });
    }

    member.role = role;

    await workspace.save();

    res.json({
      ok: true,
      message: "Rol de miembro actualizado correctamente.",
      workspace,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al actualizar rol del miembro.",
      error: error.message,
    });
  }
};

const removeMemberFromWorkspace = async (req, res) => {
  try {
    const { memberUserId } = req.params;

    if (mongoose.connection.readyState !== 1) {
      return res.json({
        ok: true,
        mode: "dev-without-mongo",
        message: "Miembro simulado removido. MongoDB no está conectado.",
        memberUserId,
      });
    }

    const workspace = await Workspace.findById(req.params.id);

    if (!workspace || !workspace.isActive) {
      return res.status(404).json({
        ok: false,
        message: "Workspace no encontrado.",
      });
    }

    const member = workspace.members.find(
      (member) => member.userId === memberUserId && member.status !== "removed"
    );

    if (!member) {
      return res.status(404).json({
        ok: false,
        message: "Miembro no encontrado.",
      });
    }

    if (member.role === "owner") {
      return res.status(400).json({
        ok: false,
        message: "No puedes remover al owner del workspace.",
      });
    }

    member.status = "removed";

    await workspace.save();

    res.json({
      ok: true,
      message: "Miembro removido correctamente.",
      workspace,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al remover miembro.",
      error: error.message,
    });
  }
};


module.exports = {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  addMemberToWorkspace,
  updateMemberRole,
  removeMemberFromWorkspace,
};