import express from "express";
import {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  editarProducto,
  desactivarProducto,
  obtenerProductosAdmin,
  reactivarProducto,
  agregarImagenProducto,
  actualizarImagenProducto,
  eliminarImagenProducto,
} from "../controllers/productoController.js";

const router = express.Router();

router.get("/", obtenerProductos);
router.post("/", crearProducto);

router.get("/admin/todos", obtenerProductosAdmin);

router.post("/:id/imagenes", agregarImagenProducto);
router.put("/imagenes/:imagenId", actualizarImagenProducto);
router.delete("/imagenes/:imagenId", eliminarImagenProducto);

router.get("/:id", obtenerProductoPorId);
router.put("/:id", editarProducto);
router.delete("/:id", desactivarProducto);
router.patch("/:id/reactivar", reactivarProducto);

export default router;