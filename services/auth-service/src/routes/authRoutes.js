import { Router } from "express";
import jwt from "jsonwebtoken";

import {
  getUserById,
  getUsers,
  login,
  me,
  register,
} from "../controllers/authController.js";

const router = Router();

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      ok: false,
      message: "No se envió token.",
    });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch {
    return res.status(401).json({
      ok: false,
      message: "Token inválido o expirado.",
    });
  }
}

router.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "auth-service",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

router.post("/register", register);
router.post("/login", login);

router.get("/me", authMiddleware, me);
router.get("/users", authMiddleware, getUsers);
router.get("/users/:id", authMiddleware, getUserById);

export default router;
