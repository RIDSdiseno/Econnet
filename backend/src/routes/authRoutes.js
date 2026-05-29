import express from "express";
import {
  registrarUsuario,
  loginUsuario,
  obtenerPerfil,
} from "../controllers/authController.js";
import { protegerRuta } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/registro", registrarUsuario);
router.post("/login", loginUsuario);
router.get("/perfil", protegerRuta, obtenerPerfil);

export default router;