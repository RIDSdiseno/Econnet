import express from "express";
import {
  obtenerAnuncios,
  obtenerAnunciosAdmin,
  crearAnuncio,
  editarAnuncio,
  desactivarAnuncio,
  reactivarAnuncio,
} from "../controllers/anuncioController.js";

const router = express.Router();

router.get("/", obtenerAnuncios);
router.get("/admin/todos", obtenerAnunciosAdmin);

router.post("/", crearAnuncio);
router.put("/:id", editarAnuncio);
router.delete("/:id", desactivarAnuncio);
router.patch("/:id/reactivar", reactivarAnuncio);

export default router;