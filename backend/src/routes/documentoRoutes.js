import express from "express";
import { descargarDocumentoPedido } from "../controllers/documentoController.js";
import { protegerRuta } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get(
  "/pedidos/:id/pdf",
  protegerRuta,
  descargarDocumentoPedido,
);

export default router;