import express from "express";

import { obtenerAnuncios } from "../controllers/anuncioController.js";

const router = express.Router();

router.get("/", obtenerAnuncios);

export default router;