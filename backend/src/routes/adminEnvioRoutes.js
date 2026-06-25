import express from "express";
import {
  generarEnvioBlueExpressAdmin,
  obtenerEnviosPedidoAdmin,
} from "../controllers/adminEnvioController.js";
import { protegerRuta } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/pedidos/:pedidoId", protegerRuta, obtenerEnviosPedidoAdmin);

router.post(
  "/pedidos/:pedidoId/blue-express",
  protegerRuta,
  generarEnvioBlueExpressAdmin,
);

export default router;