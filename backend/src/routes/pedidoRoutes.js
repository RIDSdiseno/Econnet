import express from "express";
import {
  crearPedido,
  obtenerPedidos,
  obtenerPedidoPorId,
  actualizarEstadoPedido,
} from "../controllers/pedidoController.js";
import { protegerRuta } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protegerRuta, crearPedido);
router.get("/", protegerRuta, obtenerPedidos);
router.get("/:id", protegerRuta, obtenerPedidoPorId);
router.put("/:id/estado", protegerRuta, actualizarEstadoPedido);

export default router;