import express from "express";
import {
  crearTicketSoporte,
  obtenerMisSolicitudes,
  obtenerMiSolicitudPorId,
  responderMiSolicitud,
} from "../controllers/soporteController.js";
import {
  autenticacionOpcional,
  protegerRuta,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

/*
 * Rutas privadas del cliente.
 */
router.get(
  "/mis-solicitudes",
  protegerRuta,
  obtenerMisSolicitudes,
);

router.get(
  "/mis-solicitudes/:id",
  protegerRuta,
  obtenerMiSolicitudPorId,
);

router.post(
  "/mis-solicitudes/:id/respuestas",
  protegerRuta,
  responderMiSolicitud,
);

/*
 * Ruta pública.
 * Asocia al usuario solamente cuando recibe un token válido.
 */
router.post(
  "/",
  autenticacionOpcional,
  crearTicketSoporte,
);

export default router;