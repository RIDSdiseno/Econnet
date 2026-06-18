import express from "express";
import {
  crearPagoWebpay,
  retornoWebpay,
  crearPagoOneclick,
} from "../controllers/pagoController.js";
import { protegerRuta } from "../middlewares/authMiddleware.js";

import {
  crearPagoMercadoPago,
  retornoMercadoPago,
} from "../controllers/mercadoPagoController.js";

const router = express.Router();

router.post("/webpay/crear", protegerRuta, crearPagoWebpay);
router.all("/webpay/retorno", retornoWebpay);

router.post("/oneclick/crear", protegerRuta, crearPagoOneclick);
router.post(
  "/mercadopago/crear",
  protegerRuta,
  crearPagoMercadoPago,
);

router.get(
  "/mercadopago/retorno",
  retornoMercadoPago,
);

export default router;