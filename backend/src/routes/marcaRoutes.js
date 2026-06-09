import express from "express";
import {
  obtenerMarcas,
  obtenerMarcaPorId,
  obtenerMarcasHome,
} from "../controllers/marcaController.js";


const router = express.Router();

router.get("/", obtenerMarcas);
router.get("/home", obtenerMarcasHome);
router.get("/:id", obtenerMarcaPorId);


export default router;