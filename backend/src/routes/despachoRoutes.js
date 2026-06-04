import express from "express";
import { calcularDespachoPedido } from "../controllers/despachoController.js";
import { protegerRuta } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/calcular", protegerRuta, calcularDespachoPedido);

export default router;