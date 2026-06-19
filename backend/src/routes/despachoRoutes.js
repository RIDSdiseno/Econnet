import express from "express";
import { calcularDespachoPedido } from "../controllers/despachoController.js";
import { autenticacionOpcional } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/calcular", autenticacionOpcional, calcularDespachoPedido);

export default router;