import express from "express";
import {
  crearPedido,
  obtenerPedidos,
  obtenerPedidoPorId,
} from "../controllers/pedidoController.js";
import {
  protegerRuta,
  autenticacionOpcional,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", autenticacionOpcional, crearPedido);

router.get("/", protegerRuta, obtenerPedidos);
router.get("/:id", protegerRuta, obtenerPedidoPorId);

export default router;