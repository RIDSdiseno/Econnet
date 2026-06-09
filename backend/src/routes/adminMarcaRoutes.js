import express from "express";
import { protegerRuta } from "../middlewares/authMiddleware.js";
import { soloAdmin } from "../middlewares/adminMiddleware.js";

import {
    obtenerMarcasAdmin,
    crearMarcaAdmin,
    actualizarMarcaAdmin,
} from "../controllers/adminMarcaController.js";

const router = express.Router();

router.get("/", protegerRuta, soloAdmin, obtenerMarcasAdmin);
router.post("/", protegerRuta, soloAdmin, crearMarcaAdmin);
router.put("/:id", protegerRuta, soloAdmin, actualizarMarcaAdmin);

export default router;