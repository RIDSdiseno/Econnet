import express from "express";
import {
  obtenerCarrito,
  agregarProductoCarrito,
  actualizarCantidadCarrito,
  eliminarProductoCarrito,
  vaciarCarrito,
} from "../controllers/carritoController.js";
import { protegerRuta } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", protegerRuta, obtenerCarrito);
router.post("/:productoId", protegerRuta, agregarProductoCarrito);
router.put("/:productoId", protegerRuta, actualizarCantidadCarrito);
router.delete("/:productoId", protegerRuta, eliminarProductoCarrito);
router.delete("/", protegerRuta, vaciarCarrito);

export default router;