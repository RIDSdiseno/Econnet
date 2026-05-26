import express from "express";
import {
  obtenerCategorias,
  obtenerCategoriaPorId,
} from "../controllers/categoriaController.js";

const router = express.Router();

router.get("/", obtenerCategorias);
router.get("/:id", obtenerCategoriaPorId);

export default router;