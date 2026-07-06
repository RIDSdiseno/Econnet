import express from "express";
import {
  obtenerCategorias,
  obtenerCategoriaPorId,
  editarCategoria,
} from "../controllers/categoriaController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

router.get("/", asyncHandler(obtenerCategorias));
router.get("/:id", asyncHandler(obtenerCategoriaPorId));
router.put("/:id", editarCategoria);

export default router;
