import express from "express";
import { protegerRuta } from "../middlewares/authMiddleware.js";
import { soloAdmin } from "../middlewares/adminMiddleware.js";

import {
  obtenerAnunciosAdmin,
  crearAnuncio,
  editarAnuncio,
  desactivarAnuncio,
  reactivarAnuncio,
} from "../controllers/anuncioController.js";

const router = express.Router();

router.get("/", protegerRuta, soloAdmin, obtenerAnunciosAdmin);
router.post("/", protegerRuta, soloAdmin, crearAnuncio);
router.put("/:id", protegerRuta, soloAdmin, editarAnuncio);
router.delete("/:id", protegerRuta, soloAdmin, desactivarAnuncio);
router.patch("/:id/reactivar", protegerRuta, soloAdmin, reactivarAnuncio);

export default router;