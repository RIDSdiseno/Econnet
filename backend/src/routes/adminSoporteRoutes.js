import express from "express";

import { protegerRuta } from "../middlewares/authMiddleware.js";
import { soloAdmin } from "../middlewares/adminMiddleware.js";

import {
  actualizarEstadoTicketSoporteAdmin,
  obtenerTicketSoporteAdminPorId,
  obtenerTicketsSoporteAdmin,
  responderTicketSoporteAdmin,
} from "../controllers/adminSoporteController.js";

const router = express.Router();

router.use(protegerRuta, soloAdmin);

router.get("/", obtenerTicketsSoporteAdmin);

router.get("/:id", obtenerTicketSoporteAdminPorId);

router.post(
  "/:id/respuestas",
  responderTicketSoporteAdmin,
);

router.put(
  "/:id/estado",
  actualizarEstadoTicketSoporteAdmin,
);

export default router;