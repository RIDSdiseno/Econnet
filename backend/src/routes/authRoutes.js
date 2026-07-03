import express from "express";
import {
  registrarUsuario,
  loginUsuario,
  obtenerPerfil,
  actualizarPerfil,
  cambiarPassword,
} from "../controllers/authController.js";
import { protegerRuta } from "../middlewares/authMiddleware.js";
import {
  authRateLimiter,
  registroRateLimiter,
} from "../middlewares/rateLimitMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import {
  loginSchema,
  registroSchema,
} from "../validations/authSchemas.js";

const router = express.Router();

router.post(
  "/registro",
  registroRateLimiter,
  validateRequest({ body: registroSchema }),
  registrarUsuario,
);
router.post(
  "/login",
  authRateLimiter,
  validateRequest({ body: loginSchema }),
  loginUsuario,
);
router.get("/perfil", protegerRuta, obtenerPerfil);
router.put("/perfil", protegerRuta, actualizarPerfil);
router.put("/password", protegerRuta, cambiarPassword);


export default router;

