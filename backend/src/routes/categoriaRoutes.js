import express from "express";
import {
  obtenerCategorias,
  obtenerCategoriaPorId,
  editarCategoria,
} from "../controllers/categoriaController.js";

const router = express.Router();

router.get("/", obtenerCategorias);
router.get("/:id", obtenerCategoriaPorId);
router.put("/:id", editarCategoria);

export default router;
