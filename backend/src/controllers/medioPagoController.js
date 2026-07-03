import logger, { serializeError } from "../config/logger.js";
import transbankSdk from "transbank-sdk";
import prisma from "../config/prisma.js";

const {
    Environment,
    IntegrationApiKeys,
    IntegrationCommerceCodes,
    Options,
    Oneclick,
} = transbankSdk;

function crearInscripcionOneclick() {
    return new Oneclick.MallInscription(
        new Options(
            IntegrationCommerceCodes.ONECLICK_MALL,
            IntegrationApiKeys.WEBPAY,
            Environment.Integration,
        ),
    );
}

function generarUsername(usuarioId) {
    return `econnet_user_${usuarioId}`;
}

function crearResumenInscripcionOneclick(response) {
    return {
        responseCode: response.response_code ?? response.responseCode ?? null,
        authorizationCode:
            response.authorization_code ?? response.authorizationCode ?? null,
        cardType: response.card_type ?? response.cardType ?? null,
        tieneTbkUser: Boolean(
            response.tbk_user ||
            response.transbank_user ||
            response.transbankUser,
        ),
        ultimos4: response.card_number || response.cardNumber
            ? String(response.card_number || response.cardNumber).slice(-4)
            : null,
    };
}

export async function obtenerMediosPago(req, res) {
    try {
        const mediosPago = await prisma.medioPago.findMany({
            where: {
                usuarioId: req.usuario.id,
                activo: true,
            },
            orderBy: [
                {
                    principal: "desc",
                },
                {
                    createdAt: "desc",
                },
            ],
        });

        return res.json({
            ok: true,
            mediosPago,
        });
    } catch (error) {
        logger.error("Error al obtener medios de pago:", serializeError(error));

        return res.status(500).json({
            ok: false,
            mensaje: "Error al obtener medios de pago",
            error: error.message,
        });
    }
}

export async function iniciarInscripcionMedioPago(req, res) {
    try {
        const usuario = req.usuario;

        const username = generarUsername(usuario.id);

        const responseUrl =
            process.env.ONECLICK_RETURN_URL ||
            "http://localhost:3000/api/medios-pago/oneclick/retorno";

        const inscription = crearInscripcionOneclick();

        const response = await inscription.start(
            username,
            usuario.email,
            responseUrl,
        );

        await prisma.medioPagoInscripcion.create({
            data: {
                usuarioId: usuario.id,
                token: response.token,
                username,
                estado: "pendiente",
            },
        });

        return res.json({
            ok: true,
            mensaje: "Inscripción iniciada correctamente",
            data: {
                token: response.token,
                urlWebpay: response.url_webpay,
            },
        });
    } catch (error) {
        logger.error("Error al iniciar inscripción Oneclick:", serializeError(error));

        return res.status(500).json({
            ok: false,
            mensaje: "No se pudo iniciar la inscripción del medio de pago",
            error: error.message,
        });
    }
}

export async function retornoInscripcionMedioPago(req, res) {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    let token = null;
    let inscripcionPendiente = null;

    try {
        token =
            req.body?.TBK_TOKEN ||
            req.query?.TBK_TOKEN ||
            req.body?.tbk_token ||
            req.query?.tbk_token;

        const ordenCompraAnulada =
            req.body?.TBK_ORDEN_COMPRA || req.query?.TBK_ORDEN_COMPRA;

        const idSesionAnulada =
            req.body?.TBK_ID_SESION || req.query?.TBK_ID_SESION;

        if (!token) {
            return res.redirect(
                `${frontendUrl}/mi-cuenta?seccion=medios-pago&error=sin_token`,
            );
        }

        inscripcionPendiente = await prisma.medioPagoInscripcion.findUnique({
            where: {
                token,
            },
            include: {
                usuario: true,
            },
        });

        if (!inscripcionPendiente) {
            return res.redirect(
                `${frontendUrl}/mi-cuenta?seccion=medios-pago&error=inscripcion_no_encontrada`,
            );
        }

        if (inscripcionPendiente.estado !== "pendiente") {
            return res.redirect(
                `${frontendUrl}/mi-cuenta?seccion=medios-pago&error=inscripcion_ya_procesada`,
            );
        }

        // Si Transbank devuelve estos campos, normalmente corresponde a anulación/cancelación.
        if (ordenCompraAnulada || idSesionAnulada) {
            await prisma.medioPagoInscripcion.update({
                where: {
                    id: inscripcionPendiente.id,
                },
                data: {
                    estado: "cancelada",
                },
            });

            return res.redirect(
                `${frontendUrl}/mi-cuenta?seccion=medios-pago&error=inscripcion_cancelada`,
            );
        }

        const inscription = crearInscripcionOneclick();

        const response = await inscription.finish(token);

        logger.info(
            "Respuesta finish Oneclick",
            crearResumenInscripcionOneclick(response),
        );

        const responseCode = response.response_code ?? response.responseCode;

        const tbkUser =
            response.tbk_user ??
            response.transbank_user ??
            response.transbankUser;

        const authorizationCode =
            response.authorization_code ?? response.authorizationCode;

        const cardType = response.card_type ?? response.cardType;

        const cardNumber = response.card_number ?? response.cardNumber;
        if (responseCode !== 0) {
            await prisma.medioPagoInscripcion.update({
                where: {
                    id: inscripcionPendiente.id,
                },
                data: {
                    estado: "rechazada",
                },
            });

            return res.redirect(
                `${frontendUrl}/mi-cuenta?seccion=medios-pago&error=inscripcion_rechazada`,
            );
        }

        if (!tbkUser) {
            throw new Error("Transbank no devolvió tbkUser");
        }

        const ultimos4 = cardNumber ? String(cardNumber).slice(-4) : null;

        const cantidadMediosPago = await prisma.medioPago.count({
            where: {
                usuarioId: inscripcionPendiente.usuarioId,
                activo: true,
            },
        });

        await prisma.$transaction(async (tx) => {
            if (cantidadMediosPago === 0) {
                await tx.medioPago.updateMany({
                    where: {
                        usuarioId: inscripcionPendiente.usuarioId,
                    },
                    data: {
                        principal: false,
                    },
                });
            }

            await tx.medioPago.create({
                data: {
                    usuarioId: inscripcionPendiente.usuarioId,
                    proveedor: "transbank_oneclick",
                    username: inscripcionPendiente.username,
                    tbkUser,
                    tipoTarjeta: cardType || null,
                    ultimos4,
                    codigoAutorizacion: authorizationCode || null,
                    activo: true,
                    principal: cantidadMediosPago === 0,
                },
            });

            await tx.medioPagoInscripcion.update({
                where: {
                    id: inscripcionPendiente.id,
                },
                data: {
                    estado: "completada",
                },
            });
        });

        return res.redirect(
            `${frontendUrl}/mi-cuenta?seccion=medios-pago&ok=medio_pago_guardado`,
        );
    } catch (error) {
        logger.error(
            "Error al finalizar inscripción Oneclick",
            serializeError(error),
        );

        if (inscripcionPendiente) {
            await prisma.medioPagoInscripcion.update({
                where: {
                    id: inscripcionPendiente.id,
                },
                data: {
                    estado: "error",
                },
            });
        }

        return res.redirect(
            `${frontendUrl}/mi-cuenta?seccion=medios-pago&error=inscripcion_error`,
        );
    }
}

export async function eliminarMedioPago(req, res) {
    try {
        const { id } = req.params;

        const medioPago = await prisma.medioPago.findFirst({
            where: {
                id: Number(id),
                usuarioId: req.usuario.id,
            },
        });

        if (!medioPago) {
            return res.status(404).json({
                ok: false,
                mensaje: "Medio de pago no encontrado",
            });
        }

        await prisma.medioPago.update({
            where: {
                id: medioPago.id,
            },
            data: {
                activo: false,
                principal: false,
            },
        });

        return res.json({
            ok: true,
            mensaje: "Medio de pago eliminado correctamente",
        });
    } catch (error) {
        logger.error("Error al eliminar medio de pago:", serializeError(error));

        return res.status(500).json({
            ok: false,
            mensaje: "Error al eliminar medio de pago",
            error: error.message,
        });
    }
}
