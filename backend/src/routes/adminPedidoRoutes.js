import logger, { serializeError } from "../config/logger.js";
import express from "express";
import { protegerRuta } from "../middlewares/authMiddleware.js";
import { soloAdmin } from "../middlewares/adminMiddleware.js";

import {
    obtenerPedidosAdmin,
    obtenerPedidoAdminPorId,
} from "../controllers/adminPedidoController.js";

import { actualizarEstadoPedido } from "../controllers/pedidoController.js";

const router = express.Router();

router.get(
    "/",
    protegerRuta,
    soloAdmin,
    obtenerPedidosAdmin,
);

router.get(
    "/:id",
    protegerRuta,
    soloAdmin,
    obtenerPedidoAdminPorId,
);

router.put(
    "/:id/estado",
    protegerRuta,
    soloAdmin,
    (req, res, next) => {
        logger.info(
            "RUTA ADMIN DE CAMBIO DE ESTADO EJECUTADA",
            req.params.id,
            req.body,
        );

        next();
    },
    actualizarEstadoPedido,
);

export default router;