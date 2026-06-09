import express from "express";
import { protegerRuta } from "../middlewares/authMiddleware.js";
import { soloAdmin } from "../middlewares/adminMiddleware.js";

import {
    obtenerCategoriasAdmin,
    crearCategoriaAdmin,
    actualizarCategoriaAdmin,
} from "../controllers/adminCategoriaController.js";

const router = express.Router();

router.get("/", protegerRuta, soloAdmin, obtenerCategoriasAdmin);
router.post("/", protegerRuta, soloAdmin, crearCategoriaAdmin);
router.put("/:id", protegerRuta, soloAdmin, actualizarCategoriaAdmin);

export default router;