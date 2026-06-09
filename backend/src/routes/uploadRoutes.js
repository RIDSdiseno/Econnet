import express from "express";
import upload from "../middlewares/upload.js";

import { protegerRuta } from "../middlewares/authMiddleware.js";
import { soloAdmin } from "../middlewares/adminMiddleware.js";

import {
  subirImagenProducto,
  subirImagenMarca,
  subirImagenAnuncio,
  subirImagenCategoria,
} from "../controllers/uploadController.js";

const router = express.Router();

router.post(
  "/producto",
  protegerRuta,
  soloAdmin,
  upload.single("imagen"),
  subirImagenProducto,
);

router.post(
  "/marca",
  protegerRuta,
  soloAdmin,
  upload.single("imagen"),
  subirImagenMarca,
);

router.post(
  "/anuncio",
  protegerRuta,
  soloAdmin,
  upload.single("imagen"),
  subirImagenAnuncio,
);

router.post(
  "/categoria",
  protegerRuta,
  soloAdmin,
  upload.single("imagen"),
  subirImagenCategoria,
);

export default router;