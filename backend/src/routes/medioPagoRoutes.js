import express from "express";
import {
  obtenerMediosPago,
  iniciarInscripcionMedioPago,
  retornoInscripcionMedioPago,
  eliminarMedioPago,
} from "../controllers/medioPagoController.js";
import { protegerRuta } from "../middlewares/authMiddleware.js";
import { pagosRateLimiter } from "../middlewares/rateLimitMiddleware.js";

const router = express.Router();

router.get("/", protegerRuta, obtenerMediosPago);
router.post(
  "/oneclick/iniciar",
  pagosRateLimiter,
  protegerRuta,
  iniciarInscripcionMedioPago,
);
router.all("/oneclick/retorno", retornoInscripcionMedioPago);
router.delete("/:id", protegerRuta, eliminarMedioPago);

export default router;
