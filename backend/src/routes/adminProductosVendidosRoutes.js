import express from "express";
import { protegerRuta } from "../middlewares/authMiddleware.js";
import { soloAdmin } from "../middlewares/adminMiddleware.js";
import {
  obtenerProductosVendidosDetalle,
  obtenerResumenProductosVendidos,
  obtenerFiltrosProductosVendidos,
} from "../controllers/adminProductosVendidosController.js";

const router = express.Router();

router.get(
  "/",
  protegerRuta,
  soloAdmin,
  obtenerProductosVendidosDetalle,
);

router.get(
  "/resumen",
  protegerRuta,
  soloAdmin,
  obtenerResumenProductosVendidos,
);

router.get(
  "/filtros",
  protegerRuta,
  soloAdmin,
  obtenerFiltrosProductosVendidos,
);

export default router;