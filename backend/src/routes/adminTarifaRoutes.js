import express from "express";
import { protegerRuta } from "../middlewares/authMiddleware.js";
import { soloAdmin } from "../middlewares/adminMiddleware.js";

import {
    obtenerTarifasAdmin,
    actualizarTarifaAdmin,
} from "../controllers/adminTarifaController.js";

const router = express.Router();

router.get("/", protegerRuta, soloAdmin, obtenerTarifasAdmin);
router.put("/:id", protegerRuta, soloAdmin, actualizarTarifaAdmin);

export default router;