import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { User } from "../models/User.js";

function createToken(user) {
  return jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
}

function formatUser(user) {
  return {
    id: user._id,
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        ok: false,
        message: "Nombre, correo y contraseña son obligatorios.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        ok: false,
        message: "La contraseña debe tener al menos 6 caracteres.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        ok: false,
        message: "Ya existe un usuario con ese correo.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: role || "Miembro",
    });

    const token = createToken(user);

    return res.status(201).json({
      ok: true,
      message: "Usuario registrado correctamente.",
      token,
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Error en register:", error);

    return res.status(500).json({
      ok: false,
      message: "Error interno al registrar usuario.",
    });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        message: "Correo y contraseña son obligatorios.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        ok: false,
        message: "Credenciales inválidas.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        ok: false,
        message: "Credenciales inválidas.",
      });
    }

    const token = createToken(user);

    return res.json({
      ok: true,
      message: "Inicio de sesión correcto.",
      token,
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Error en login:", error);

    return res.status(500).json({
      ok: false,
      message: "Error interno al iniciar sesión.",
    });
  }
}

export async function me(req, res) {
  return res.json({
    ok: true,
    user: req.user,
  });
}

export async function getUsers(req, res) {
  try {
    const search = req.query.search || "";

    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { role: { $regex: search, $options: "i" } },
            { status: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find(filter)
      .select("-passwordHash")
      .sort({ createdAt: -1 });

    return res.json({
      ok: true,
      users,
    });
  } catch (error) {
    console.error("Error en getUsers:", error);

    return res.status(500).json({
      ok: false,
      message: "Error interno al obtener usuarios.",
    });
  }
}

export async function getUserById(req, res) {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-passwordHash");

    if (!user) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado.",
      });
    }

    return res.json({
      ok: true,
      user,
    });
  } catch (error) {
    console.error("Error en getUserById:", error);

    return res.status(500).json({
      ok: false,
      message: "Error interno al obtener usuario.",
    });
  }
}

export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const requester = req.user;

    if (String(requester.id) === String(id)) {
      return res.status(400).json({
        ok: false,
        message: "No puedes eliminar tu propio usuario.",
      });
    }

    if (
      requester.role !== "Propietario" &&
      requester.role !== "Administrador"
    ) {
      return res.status(403).json({
        ok: false,
        message: "No tienes permisos para eliminar usuarios.",
      });
    }

    const user = await User.findByIdAndDelete(id).select("-passwordHash");

    if (!user) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado.",
      });
    }

    return res.json({
      ok: true,
      message: "Usuario eliminado correctamente.",
      user,
    });
  } catch (error) {
    console.error("Error en deleteUser:", error);

    return res.status(500).json({
      ok: false,
      message: "Error interno al eliminar usuario.",
    });
  }
}

export async function changePassword(req, res) {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        ok: false,
        message: "Contraseña actual y nueva contraseña son obligatorias.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        ok: false,
        message: "La nueva contraseña debe tener al menos 6 caracteres.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado.",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        ok: false,
        message: "La contraseña actual no es correcta.",
      });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);

    await user.save();

    return res.json({
      ok: true,
      message: "Contraseña actualizada correctamente.",
    });
  } catch (error) {
    console.error("Error en changePassword:", error);

    return res.status(500).json({
      ok: false,
      message: "Error interno al cambiar contraseña.",
    });
  }
}