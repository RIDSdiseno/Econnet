import express from "express";
import {
  registrarUsuario,
  loginUsuario,
  obtenerPerfil,
  actualizarPerfil,
  cambiarPassword,
} from "../controllers/authController.js";
import { protegerRuta } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/registro", registrarUsuario);
router.post("/login", loginUsuario);
router.get("/perfil", protegerRuta, obtenerPerfil);
router.put("/perfil", protegerRuta, actualizarPerfil);
router.put("/password", protegerRuta, cambiarPassword);


export default router;

