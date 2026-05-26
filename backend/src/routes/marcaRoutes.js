import express from "express";
import {
  obtenerMarcas,
  obtenerMarcaPorId,
} from "../controllers/marcaController.js";

const router = express.Router();

router.get("/", obtenerMarcas);
router.get("/:id", obtenerMarcaPorId);

export default router;