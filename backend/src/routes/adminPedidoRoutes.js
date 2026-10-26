import logger, { serializeError } from "../config/logger.js";
import express from "express";
import { protegerRuta } from "../middlewares/authMiddleware.js";
import { soloAdmin } from "../middlewares/adminMiddleware.js";

import {
    obtenerPedidosAdmin,
    obtenerPedidoAdminPorId,
} from "../controllers/adminPedidoController.js";

import { actualizarEstadoPedido } from "../controllers/pedidoController.js";
import { enviarDocumentoPedidoPorCorreo, enviarNotificacionPedidoInterno } from "../services/emailService.js";
import prisma from "../config/prisma.js";

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

// Endpoint de prueba: reenvía el correo de un pedido al admin
router.post(
    "/:id/test-email",
    protegerRuta,
    soloAdmin,
    async (req, res) => {
        try {
            const id = Number(req.params.id);
            const pedido = await prisma.pedido.findUnique({
                where: { id },
                include: { items: true },
            });
            if (!pedido) return res.status(404).json({ ok: false, mensaje: "Pedido no encontrado" });

            // Reset estado para permitir reenvío
            await prisma.pedido.update({
                where: { id },
                data: { documentoEmailEstado: "pendiente" },
            });

            await enviarNotificacionPedidoInterno(pedido);
            const resultado = await enviarDocumentoPedidoPorCorreo(id);
            res.json({ ok: true, resultado });
        } catch (error) {
            logger.error("Error en test-email:", serializeError(error));
            res.status(500).json({ ok: false, error: error.message });
        }
    }
);

export default router;