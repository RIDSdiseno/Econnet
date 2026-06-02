import express from "express";
import {
  obtenerFavoritos,
  agregarFavorito,
  eliminarFavorito,
} from "../controllers/favoritoController.js";
import { protegerRuta } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", protegerRuta, obtenerFavoritos);
router.post("/:productoId", protegerRuta, agregarFavorito);
router.delete("/:productoId", protegerRuta, eliminarFavorito);

export default router;