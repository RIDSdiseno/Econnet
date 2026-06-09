import express from "express";
import { protegerRuta } from "../middlewares/authMiddleware.js";
import { soloAdmin } from "../middlewares/adminMiddleware.js";
import {
    obtenerUsuariosAdmin,
    actualizarUsuarioAdmin,
} from "../controllers/adminUsuarioController.js";

const router = express.Router();

router.get("/", protegerRuta, soloAdmin, obtenerUsuariosAdmin);
router.put("/:id", protegerRuta, soloAdmin, actualizarUsuarioAdmin);

export default router;