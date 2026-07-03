import express from "express";
import {
  crearPagoWebpay,
  retornoWebpay,
  crearPagoOneclick,
} from "../controllers/pagoController.js";
import {
  protegerRuta,
  autenticacionOpcional,
} from "../middlewares/authMiddleware.js";

import {
  crearPagoMercadoPago,
  retornoMercadoPago,
  webhookMercadoPago,
} from "../controllers/mercadoPagoController.js";
import { pagosRateLimiter } from "../middlewares/rateLimitMiddleware.js";

const router = express.Router();

router.post(
  "/webpay/crear",
  pagosRateLimiter,
  autenticacionOpcional,
  crearPagoWebpay,
);
router.all("/webpay/retorno", retornoWebpay);

router.post(
  "/oneclick/crear",
  pagosRateLimiter,
  protegerRuta,
  crearPagoOneclick,
);

router.post(
  "/mercadopago/crear",
  pagosRateLimiter,
  autenticacionOpcional,
  crearPagoMercadoPago,
);

router.get(
  "/mercadopago/retorno",
  retornoMercadoPago,
);

router.post(
  "/mercadopago/webhook",
  webhookMercadoPago,
);

export default router;
