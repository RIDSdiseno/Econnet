import { randomUUID } from "node:crypto";

import prisma from "../config/prisma.js";
import {
    pagosMercadoPago,
    preferenciasMercadoPago,
} from "../config/mercadoPago.js";

import { obtenerInfoEstadoPedido } from "../utils/estadosPedido.js";
import { enviarDocumentoPedidoPorCorreo } from "../services/emailService.js";

function obtenerBackendUrl() {
    return (
        process.env.MERCADOPAGO_BACKEND_URL ||
        process.env.BACKEND_URL ||
        ""
    )
        .trim()
        .replace(/\/+$/, "");
}

function generarReferenciaExterna(pedidoId) {
    return `MP-${pedidoId}-${randomUUID()}`;
}

function pedidoEstaVencido(pedido) {
    if (!pedido.fechaVencimientoPago) {
        return false;
    }

    return new Date(pedido.fechaVencimientoPago).getTime() <= Date.now();
}

function obtenerFrontendUrl() {
    return (
        process.env.FRONTEND_URL || "http://localhost:5173"
    )
        .trim()
        .replace(/\/+$/, "");
}

function crearSeguimientoEstado(estado, detalleExtra = "") {
    const infoEstado = obtenerInfoEstadoPedido(estado);

    return {
        estado,
        titulo: infoEstado.titulo,
        detalle: detalleExtra || infoEstado.detalle,
    };
}

function enviarDocumentoMercadoPagoEnSegundoPlano(pedidoId) {
    if (process.env.EMAIL_ENABLED !== "true") {
        console.log(
            `Envío de correo desactivado para el pedido ${pedidoId}`,
        );
        return;
    }

    enviarDocumentoPedidoPorCorreo(pedidoId)
        .then((resultado) => {
            if (resultado?.omitido) {
                console.log(
                    `Correo del pedido ${pedidoId} omitido:`,
                    resultado.mensaje,
                );
                return;
            }

            console.log(
                `Correo del pedido ${pedidoId} enviado correctamente`,
            );
        })
        .catch((error) => {
            console.error(
                `No se pudo enviar el documento del pedido ${pedidoId}:`,
                error.message,
            );
        });
}

function convertirEstadoMercadoPago(estadoProveedor) {
    switch (estadoProveedor) {
        case "approved":
            return "aprobado";

        case "pending":
        case "in_process":
        case "authorized":
        case "in_mediation":
            return "pendiente";

        case "rejected":
            return "rechazado";

        case "cancelled":
            return "cancelado";

        case "refunded":
            return "reembolsado";

        case "charged_back":
            return "contracargo";

        default:
            return "pendiente";
    }
}

function crearResumenRespuestaPago(response) {
    return {
        id: response.id ? String(response.id) : null,
        status: response.status || null,
        statusDetail: response.status_detail || null,
        externalReference: response.external_reference || null,
        transactionAmount: response.transaction_amount ?? null,
        currencyId: response.currency_id || null,
        dateApproved: response.date_approved || null,
        paymentMethodId: response.payment_method_id || null,
        paymentTypeId: response.payment_type_id || null,
    };
}

function normalizarIdMercadoPago(valor) {
    const id = String(valor ?? "").trim();

    if (!id || id === "null" || id === "undefined") {
        return null;
    }

    return id;
}

function obtenerPaymentIdDesdeQuery(query) {
    return (
        normalizarIdMercadoPago(query?.payment_id) ||
        normalizarIdMercadoPago(query?.collection_id)
    );
}

async function obtenerMerchantOrderMercadoPago({ id, resource }) {
    const url = resource || `https://api.mercadolibre.com/merchant_orders/${id}`;

    const respuesta = await fetch(url, {
        headers: {
            Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        },
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(
            data.message ||
            data.error ||
            "No se pudo obtener la merchant order de Mercado Pago",
        );
    }

    return data;
}

async function procesarMerchantOrderMercadoPago({ id, resource }) {
    const merchantOrderId = normalizarIdMercadoPago(id);

    if (!merchantOrderId && !resource) {
        return {
            pedidoId: null,
            pagoId: null,
            estado: "pendiente",
            confirmado: false,
            mensaje: "Merchant order sin ID",
        };
    }

    const merchantOrder = await obtenerMerchantOrderMercadoPago({
        id: merchantOrderId,
        resource,
    });

    const pagos = Array.isArray(merchantOrder.payments)
        ? merchantOrder.payments
        : [];

    if (pagos.length === 0) {
        return {
            pedidoId: null,
            pagoId: null,
            estado: "pendiente",
            confirmado: false,
            merchantOrderId: merchantOrder.id || merchantOrderId,
            mensaje: "Merchant order sin pagos asociados",
        };
    }

    const pagoAprobado = pagos.find(
        (pago) => pago.status === "approved" && pago.id,
    );

    const pagoConId =
        pagoAprobado ||
        pagos.find((pago) => pago.id);

    if (!pagoConId?.id) {
        return {
            pedidoId: null,
            pagoId: null,
            estado: "pendiente",
            confirmado: false,
            merchantOrderId: merchantOrder.id || merchantOrderId,
            mensaje: "No se encontró un payment id en la merchant order",
        };
    }

    return procesarPagoMercadoPagoPorId(pagoConId.id);
}

export async function procesarPagoMercadoPagoPorId(
    paymentId,
) {
    if (!paymentId) {
        throw new Error(
            "No se recibió el identificador del pago de Mercado Pago",
        );
    }

    /*
     * Consultamos directamente a Mercado Pago.
     * No confiamos en el estado recibido por query string.
     */
    const response = await pagosMercadoPago.get({
        id: String(paymentId),
    });

    const pagoProveedorId = response.id
        ? String(response.id)
        : null;

    const referenciaExterna =
        response.external_reference?.trim();

    if (!pagoProveedorId || !referenciaExterna) {
        throw new Error(
            "Mercado Pago no devolvió una referencia válida",
        );
    }

    const pago = await prisma.pago.findUnique({
        where: {
            referenciaExterna,
        },
        include: {
            pedido: true,
        },
    });

    if (!pago || pago.proveedor !== "mercadopago") {
        throw new Error(
            "No se encontró el intento de pago asociado",
        );
    }

    const montoProveedor = Number(
        response.transaction_amount,
    );

    if (
        !Number.isFinite(montoProveedor) ||
        Math.round(montoProveedor) !== pago.monto ||
        pago.monto !== pago.pedido.total
    ) {
        throw new Error(
            "El monto informado por Mercado Pago no coincide con el pedido",
        );
    }

    if (response.currency_id !== "CLP") {
        throw new Error(
            "La moneda informada por Mercado Pago no es válida",
        );
    }

    const estadoInterno = convertirEstadoMercadoPago(
        response.status,
    );

    const datosPago = {
        pagoProveedorId,
        estadoProveedor: response.status || null,
        detalleEstado: response.status_detail || null,
        respuestaProveedor:
            crearResumenRespuestaPago(response),
    };

    /*
     * Los estados no aprobados actualizan el intento,
     * pero no confirman ni vacían el carrito.
     *
     * El stock seguirá reservado hasta que el pedido
     * venza o llegue un pago aprobado.
     */
    if (estadoInterno !== "aprobado") {
        const pagoActualizado = await prisma.pago.update({
            where: {
                id: pago.id,
            },
            data: {
                ...datosPago,
                estado: estadoInterno,
            },
        });

        if (
            estadoInterno === "reembolsado" ||
            estadoInterno === "contracargo"
        ) {
            await prisma.pedido.update({
                where: {
                    id: pago.pedidoId,
                },
                data: {
                    estadoPago: estadoInterno,
                },
            });
        }

        return {
            pedidoId: pago.pedidoId,
            pagoId: pagoActualizado.id,
            estado: estadoInterno,
            confirmado: false,
        };
    }

    let fechaAprobacion = response.date_approved
        ? new Date(response.date_approved)
        : new Date();

    if (Number.isNaN(fechaAprobacion.getTime())) {
        fechaAprobacion = new Date();
    }

    const resultado = await prisma.$transaction(
        async (tx) => {
            const pedidoActual = await tx.pedido.findUnique({
                where: {
                    id: pago.pedidoId,
                },
            });

            const pagoActual = await tx.pago.findUnique({
                where: {
                    id: pago.id,
                },
            });

            if (!pedidoActual || !pagoActual) {
                throw new Error(
                    "El pedido o el intento de pago ya no existe",
                );
            }

            /*
             * Caso excepcional:
             * Mercado Pago aprobó después de que Econnet ya
             * había cancelado el pedido y restaurado el stock.
             *
             * Registramos el pago como aprobado, pero dejamos
             * el pedido cancelado para revisión administrativa.
             */
            if (
                pedidoActual.stockRestaurado === true ||
                pedidoActual.estado === "cancelado"
            ) {
                const primeraRevision =
                    pagoActual.estado !== "revision_manual";

                await tx.pago.update({
                    where: {
                        id: pago.id,
                    },
                    data: {
                        ...datosPago,
                        estado: "revision_manual",
                        fechaAprobacion,
                    },
                });

                await tx.pedido.update({
                    where: {
                        id: pedidoActual.id,
                    },
                    data: {
                        estadoPago: "aprobado",
                        fechaPago: fechaAprobacion,
                        fechaVencimientoPago: null,
                    },
                });

                if (primeraRevision) {
                    await tx.pedidoSeguimiento.create({
                        data: {
                            pedidoId: pedidoActual.id,
                            ...crearSeguimientoEstado(
                                "cancelado",
                                "Mercado Pago aprobó el pago después de que el pedido fue cancelado y su stock fue restaurado. El pedido requiere revisión administrativa.",
                            ),
                        },
                    });
                }

                return {
                    pedidoId: pedidoActual.id,
                    pagoId: pago.id,
                    estado: "revision_manual",
                    confirmado: false,
                    enviarDocumento: false,
                };
            }

            /*
             * Si ya fue confirmado por un webhook o retorno
             * anterior, solo sincronizamos el registro Pago.
             */
            if (pedidoActual.estadoPago === "aprobado") {
                await tx.pago.update({
                    where: {
                        id: pago.id,
                    },
                    data: {
                        ...datosPago,
                        estado: "aprobado",
                        fechaAprobacion,
                    },
                });

                return {
                    pedidoId: pedidoActual.id,
                    pagoId: pago.id,
                    estado: "aprobado",
                    confirmado: true,
                    enviarDocumento: false,
                };
            }

            /*
             * Reserva atómica de la confirmación.
             * Evita que retorno y webhook confirmen dos veces.
             */
            const confirmacion = await tx.pedido.updateMany({
                where: {
                    id: pedidoActual.id,
                    estadoPago: "pendiente",
                    stockRestaurado: false,
                    estado: {
                        not: "cancelado",
                    },
                },
                data: {
                    estado: "confirmado",
                    estadoPago: "aprobado",
                    fechaPago: fechaAprobacion,
                    fechaVencimientoPago: null,
                },
            });

            if (confirmacion.count === 0) {
                const pedidoDespues =
                    await tx.pedido.findUnique({
                        where: {
                            id: pedidoActual.id,
                        },
                    });

                if (
                    pedidoDespues?.stockRestaurado === true ||
                    pedidoDespues?.estado === "cancelado"
                ) {
                    await tx.pago.update({
                        where: {
                            id: pago.id,
                        },
                        data: {
                            ...datosPago,
                            estado: "revision_manual",
                            fechaAprobacion,
                        },
                    });

                    await tx.pedido.update({
                        where: {
                            id: pedidoActual.id,
                        },
                        data: {
                            estadoPago: "aprobado",
                            fechaPago: fechaAprobacion,
                            fechaVencimientoPago: null,
                        },
                    });

                    return {
                        pedidoId: pedidoActual.id,
                        pagoId: pago.id,
                        estado: "revision_manual",
                        confirmado: false,
                        enviarDocumento: false,
                    };
                }

                if (pedidoDespues?.estadoPago === "aprobado") {
                    await tx.pago.update({
                        where: {
                            id: pago.id,
                        },
                        data: {
                            ...datosPago,
                            estado: "aprobado",
                            fechaAprobacion,
                        },
                    });

                    return {
                        pedidoId: pedidoActual.id,
                        pagoId: pago.id,
                        estado: "aprobado",
                        confirmado: true,
                        enviarDocumento: false,
                    };
                }

                throw new Error(
                    "No se pudo confirmar el pedido de forma segura",
                );
            }

            await tx.pago.update({
                where: {
                    id: pago.id,
                },
                data: {
                    ...datosPago,
                    estado: "aprobado",
                    fechaAprobacion,
                },
            });

            await tx.pedidoSeguimiento.create({
                data: {
                    pedidoId: pedidoActual.id,
                    ...crearSeguimientoEstado(
                        "confirmado",
                        "Pago aprobado correctamente por Mercado Pago.",
                    ),
                },
            });

            if (pedidoActual.usuarioId && pedidoActual.descuento > 0) {
                await tx.usuario.update({
                    where: {
                        id: pedidoActual.usuarioId,
                    },
                    data: {
                        descuentoBienvenidaDisponible: false,
                        descuentoBienvenidaUsado: true,
                    },
                });

                await tx.newsletterSuscriptor.updateMany({
                    where: {
                        email: pedidoActual.emailCliente,
                    },
                    data: {
                        usado: true,
                    },
                });
            }

            if (pedidoActual.usuarioId) {
                await tx.carritoItem.deleteMany({
                    where: {
                        usuarioId: pedidoActual.usuarioId,
                    },
                });
            }

            return {
                pedidoId: pedidoActual.id,
                pagoId: pago.id,
                estado: "aprobado",
                confirmado: true,
                enviarDocumento: true,
            };
        },
    );

    if (resultado.enviarDocumento) {
        enviarDocumentoMercadoPagoEnSegundoPlano(
            resultado.pedidoId,
        );
    }

    return resultado;
}

export async function crearPagoMercadoPago(req, res) {
    let pagoCreado = null;

    try {
        const { pedidoId } = req.body;

        if (!pedidoId || Number.isNaN(Number(pedidoId))) {
            return res.status(400).json({
                ok: false,
                mensaje: "El pedidoId es obligatorio",
            });
        }



        /*
         * Usuario logueado:
         *   solo puede pagar sus propios pedidos.
         *
         * Invitado:
         *   solo puede pagar pedidos sin usuario asociado.
         */
        const usuarioAutenticado = req.usuario || null;

        const pedido = await prisma.pedido.findFirst({
            where: {
                id: Number(pedidoId),
                ...(usuarioAutenticado
                    ? {
                        usuarioId: usuarioAutenticado.id,
                    }
                    : {
                        usuarioId: null,
                    }),
            },
            include: {
                items: true,
            },
        });
        if (!pedido) {
            return res.status(404).json({
                ok: false,
                mensaje: "Pedido no encontrado",
            });
        }

        if (!pedido.items || pedido.items.length === 0) {
            return res.status(400).json({
                ok: false,
                mensaje: "El pedido no tiene productos asociados",
            });
        }

        if (pedido.metodoPago !== "mercadopago") {
            return res.status(400).json({
                ok: false,
                mensaje:
                    "El pedido no fue creado con Mercado Pago como método de pago",
            });
        }

        if (pedido.total <= 0) {
            return res.status(400).json({
                ok: false,
                mensaje: "El total del pedido debe ser mayor a 0",
            });
        }

        if (pedido.estadoPago === "aprobado") {
            return res.status(400).json({
                ok: false,
                mensaje: "Este pedido ya tiene un pago aprobado",
            });
        }

        if (
            pedido.estado === "cancelado" ||
            pedido.stockRestaurado === true
        ) {
            return res.status(400).json({
                ok: false,
                mensaje:
                    "Este pedido fue cancelado y ya no puede ser pagado",
            });
        }

        if (pedidoEstaVencido(pedido)) {
            return res.status(400).json({
                ok: false,
                mensaje:
                    "El plazo para pagar este pedido ya venció",
            });
        }

        /*
         * Si el usuario presiona dos veces el botón de pago,
         * reutilizamos la preferencia pendiente en vez de crear otra.
         */
        const pagoPendiente = await prisma.pago.findFirst({
            where: {
                pedidoId: pedido.id,
                proveedor: "mercadopago",
                estado: "pendiente",
                preferenciaId: {
                    not: null,
                },
                urlPago: {
                    not: null,
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        if (pagoPendiente) {
            return res.json({
                ok: true,
                mensaje:
                    "Se reutilizó la preferencia pendiente de Mercado Pago",
                data: {
                    pagoId: pagoPendiente.id,
                    preferenciaId: pagoPendiente.preferenciaId,
                    referenciaExterna:
                        pagoPendiente.referenciaExterna,
                    urlPago: pagoPendiente.urlPago,
                },
            });
        }

        const referenciaExterna =
            generarReferenciaExterna(pedido.id);

        /*
         * Primero registramos el intento en Econnet.
         */
        pagoCreado = await prisma.pago.create({
            data: {
                pedidoId: pedido.id,
                proveedor: "mercadopago",
                estado: "creando",
                monto: pedido.total,
                moneda: "CLP",
                referenciaExterna,
            },
        });

        const backendUrl = obtenerBackendUrl();

        const body = {
            items: [
                {
                    id: String(pedido.id),
                    title: `Pedido ${pedido.numero}`,
                    description: `${pedido.items.length} producto(s) de Econnet`,
                    quantity: 1,
                    currency_id: "CLP",
                    unit_price: pedido.total,
                },
            ],

            external_reference: referenciaExterna,

            binary_mode: true,

            payer: {
                email: pedido.emailCliente,
                name: pedido.nombreCliente || undefined,
            },

            metadata: {
                pedido_id: pedido.id,
                pago_id: pagoCreado.id,
                numero_pedido: pedido.numero,
            },

            payment_methods: {
                excluded_payment_types: [
                    { id: "ticket" },
                    { id: "atm" },
                    { id: "bank_transfer" },
                ],
                installments: 1,
            },

            expires: Boolean(pedido.fechaVencimientoPago),

            ...(pedido.fechaVencimientoPago
                ? {
                    expiration_date_from: new Date().toISOString(),
                    expiration_date_to:
                        pedido.fechaVencimientoPago.toISOString(),
                }
                : {}),
        };

        /*
         * Estas URLs se agregarán cuando tengamos una URL HTTPS
         * pública para el backend local.
         */
        if (backendUrl) {
            body.back_urls = {
                success:
                    `${backendUrl}/api/pagos/mercadopago/retorno` +
                    "?resultado=aprobado",
                failure:
                    `${backendUrl}/api/pagos/mercadopago/retorno` +
                    "?resultado=rechazado",
                pending:
                    `${backendUrl}/api/pagos/mercadopago/retorno` +
                    "?resultado=pendiente",
            };

            body.auto_return = "approved";

            body.notification_url =
                `${backendUrl}/api/pagos/mercadopago/webhook`;
        }

        const response = await preferenciasMercadoPago.create({
            body,
        });

        const preferenciaId = response.id
            ? String(response.id)
            : null;

        /*
         * Con credenciales de prueba normalmente usaremos
         * sandbox_init_point.
         */
        const urlPago =
            response.sandbox_init_point ||
            response.init_point ||
            null;

        if (!preferenciaId || !urlPago) {
            throw new Error(
                "Mercado Pago no devolvió una preferencia válida",
            );
        }

        const pagoActualizado = await prisma.pago.update({
            where: {
                id: pagoCreado.id,
            },
            data: {
                estado: "pendiente",
                preferenciaId,
                urlPago,
                estadoProveedor: "preference_created",
                respuestaProveedor: {
                    id: preferenciaId,
                    initPoint: response.init_point || null,
                    sandboxInitPoint:
                        response.sandbox_init_point || null,
                    dateCreated: response.date_created || null,
                },
            },
        });

        await prisma.pedido.update({
            where: {
                id: pedido.id,
            },
            data: {
                metodoPago: "mercadopago",
            },
        });

        return res.status(201).json({
            ok: true,
            mensaje:
                "Preferencia de Mercado Pago creada correctamente",
            data: {
                pagoId: pagoActualizado.id,
                preferenciaId:
                    pagoActualizado.preferenciaId,
                referenciaExterna:
                    pagoActualizado.referenciaExterna,
                urlPago: pagoActualizado.urlPago,
            },
        });
    } catch (error) {
        console.error(
            "Error al crear preferencia de Mercado Pago:",
            error,
        );

        if (pagoCreado) {
            try {
                await prisma.pago.update({
                    where: {
                        id: pagoCreado.id,
                    },
                    data: {
                        estado: "error",
                        estadoProveedor:
                            "preference_creation_error",
                        detalleEstado: error.message,
                    },
                });
            } catch (errorActualizacion) {
                console.error(
                    "No se pudo actualizar el intento de pago:",
                    errorActualizacion,
                );
            }
        }

        return res.status(500).json({
            ok: false,
            mensaje:
                "No se pudo iniciar el pago con Mercado Pago",
            error: error.message,
        });
    }
}

export async function retornoMercadoPago(req, res) {
    const frontendUrl = obtenerFrontendUrl();

    console.log("RETORNO MERCADO PAGO QUERY:", req.query);

    const paymentId = obtenerPaymentIdDesdeQuery(req.query);

    const merchantOrderId =
        normalizarIdMercadoPago(req.query?.merchant_order_id) ||
        normalizarIdMercadoPago(req.query?.merchant_order);

    try {
        let resultado = null;

        if (paymentId) {
            resultado = await procesarPagoMercadoPagoPorId(paymentId);
        } else if (merchantOrderId) {
            resultado = await procesarMerchantOrderMercadoPago({
                id: merchantOrderId,
            });
        } else {
            return res.redirect(
                `${frontendUrl}/mi-cuenta` +
                "?seccion=pedidos&info=mercadopago_sin_payment_id",
            );
        }

        console.log("RESULTADO RETORNO MERCADO PAGO:", resultado);

        if (
            resultado.estado === "aprobado" &&
            resultado.confirmado === true
        ) {
            return res.redirect(
                `${frontendUrl}/compra-exitosa` +
                `?pedidoId=${resultado.pedidoId}` +
                `&metodo=mercadopago`,
            );
        }

        if (resultado.estado === "revision_manual") {
            return res.redirect(
                `${frontendUrl}/mi-cuenta` +
                "?seccion=pedidos" +
                `&pedidoId=${resultado.pedidoId}` +
                "&error=pago_aprobado_revision",
            );
        }

        if (resultado.estado === "pendiente") {
            return res.redirect(
                `${frontendUrl}/mi-cuenta` +
                "?seccion=pedidos" +
                `${resultado.pedidoId ? `&pedidoId=${resultado.pedidoId}` : ""}` +
                "&info=pago_pendiente",
            );
        }

        return res.redirect(
            `${frontendUrl}/carrito` +
            `${resultado.pedidoId ? `?pedidoId=${resultado.pedidoId}` : "?"}` +
            `&error=mercadopago_${resultado.estado}`,
        );
    } catch (error) {
        console.error("Error en retorno de Mercado Pago:", error);

        return res.redirect(
            `${frontendUrl}/carrito?error=mercadopago_error`,
        );
    }
}

export async function webhookMercadoPago(req, res) {
    try {
        console.log("WEBHOOK MERCADO PAGO BODY:", req.body);
        console.log("WEBHOOK MERCADO PAGO QUERY:", req.query);

        const tipo =
            req.body?.type ||
            req.body?.topic ||
            req.query?.type ||
            req.query?.topic;

        if (tipo === "payment") {
            const paymentId =
                normalizarIdMercadoPago(req.body?.data?.id) ||
                normalizarIdMercadoPago(req.query?.id) ||
                normalizarIdMercadoPago(req.query?.["data.id"]);

            if (!paymentId) {
                return res.status(200).json({
                    ok: true,
                    mensaje: "Webhook payment sin paymentId",
                });
            }

            const resultado =
                await procesarPagoMercadoPagoPorId(paymentId);

            console.log("RESULTADO WEBHOOK PAYMENT:", resultado);

            return res.status(200).json({
                ok: true,
                mensaje: "Webhook payment procesado",
                data: resultado,
            });
        }

        if (tipo === "merchant_order") {
            const resultado =
                await procesarMerchantOrderMercadoPago({
                    id: req.query?.id,
                    resource: req.body?.resource,
                });

            console.log("RESULTADO WEBHOOK MERCHANT ORDER:", resultado);

            return res.status(200).json({
                ok: true,
                mensaje: "Webhook merchant_order procesado",
                data: resultado,
            });
        }

        return res.status(200).json({
            ok: true,
            mensaje: "Notificación ignorada",
            tipo,
        });
    } catch (error) {
        console.error("Error en webhook de Mercado Pago:", error);

        return res.status(500).json({
            ok: false,
            mensaje: "No se pudo procesar el webhook de Mercado Pago",
        });
    }
}