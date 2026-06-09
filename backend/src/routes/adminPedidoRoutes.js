import express from "express";
import { protegerRuta } from "../middlewares/authMiddleware.js";
import { soloAdmin } from "../middlewares/adminMiddleware.js";

import {
    obtenerPedidosAdmin,
    obtenerPedidoAdminPorId,
    actualizarEstadoPedidoAdmin,
} from "../controllers/adminPedidoController.js";

const router = express.Router();

router.get("/", protegerRuta, soloAdmin, obtenerPedidosAdmin);
router.get("/:id", protegerRuta, soloAdmin, obtenerPedidoAdminPorId);
router.put("/:id/estado", protegerRuta, soloAdmin, actualizarEstadoPedidoAdmin);

export default router;