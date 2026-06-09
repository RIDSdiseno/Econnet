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
  obtenerProductosDestacados,
} from "../controllers/productoController.js";

const router = express.Router();

/*
  Rutas específicas primero
*/
router.get("/", obtenerProductos);
router.get("/destacados", obtenerProductosDestacados);
router.get("/admin/todos", obtenerProductosAdmin);

router.post("/", crearProducto);

/*
  Rutas de imágenes
*/
router.post("/:id/imagenes", agregarImagenProducto);
router.put("/imagenes/:imagenId", actualizarImagenProducto);
router.delete("/imagenes/:imagenId", eliminarImagenProducto);

/*
  Rutas dinámicas al final
*/
router.get("/:id", obtenerProductoPorId);
router.put("/:id", editarProducto);
router.delete("/:id", desactivarProducto);
router.patch("/:id/reactivar", reactivarProducto);

export default router;