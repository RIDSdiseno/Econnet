import express from "express";
import {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  editarProducto,
  desactivarProducto,
  obtenerProductosAdmin,
  reactivarProducto,
} from "../controllers/productoController.js";

const router = express.Router();

router.get("/", obtenerProductos);
router.post("/", crearProducto);

// Ruta admin: debe ir antes de /:id
router.get("/admin/todos", obtenerProductosAdmin);

router.get("/:id", obtenerProductoPorId);
router.put("/:id", editarProducto);
router.delete("/:id", desactivarProducto);
router.patch("/:id/reactivar", reactivarProducto);

export default router;