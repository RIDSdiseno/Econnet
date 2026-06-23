import express from "express";
import {
  crearPedido,
  obtenerPedidos,
  obtenerPedidoPorId,
  obtenerSeguimientoPedidoInvitado,
  buscarPedidoInvitado,
  descargarDocumentoPedidoInvitado,
} from "../controllers/pedidoController.js";
import {
  protegerRuta,
  autenticacionOpcional,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", autenticacionOpcional, crearPedido);

router.get("/publico/buscar", buscarPedidoInvitado);

router.get(
  "/publico/:id/documento",
  descargarDocumentoPedidoInvitado,
);

router.get(
  "/publico/:id/seguimiento",
  obtenerSeguimientoPedidoInvitado,
);

router.get("/", protegerRuta, obtenerPedidos);
router.get("/:id", protegerRuta, obtenerPedidoPorId);

export default router;