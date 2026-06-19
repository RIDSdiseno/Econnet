import transbankSdk from "transbank-sdk";
import prisma from "../config/prisma.js";
import { obtenerInfoEstadoPedido } from "../utils/estadosPedido.js";
import { enviarDocumentoPedidoPorCorreo } from "../services/emailService.js";

const {
  Environment,
  IntegrationApiKeys,
  IntegrationCommerceCodes,
  Options,
  WebpayPlus,
  Oneclick,
  TransactionDetail,
} = transbankSdk;

function crearTransaccionWebpay() {
  return new WebpayPlus.Transaction(
    new Options(
      IntegrationCommerceCodes.WEBPAY_PLUS,
      IntegrationApiKeys.WEBPAY,
      Environment.Integration
    )
  );
}

function crearTransaccionOneclick() {
  return new Oneclick.MallTransaction(
    new Options(
      IntegrationCommerceCodes.ONECLICK_MALL,
      IntegrationApiKeys.WEBPAY,
      Environment.Integration
    )
  );
}

function obtenerCommerceCodeHijoOneclick() {
  return (
    process.env.TRANSBANK_ONECLICK_CHILD_COMMERCE_CODE || "597055555542"
  );
}

function generarOrdenCompraOneclick(pedidoId) {
  const timestamp = Date.now().toString().slice(-8);
  return `OC${pedidoId}${timestamp}`;
}

function generarOrdenCompraHijaOneclick(pedidoId) {
  const timestamp = Date.now().toString().slice(-8);
  return `OCH${pedidoId}${timestamp}`;
}

function obtenerDetalleOneclick(response) {
  const detalles = response.details || response.detailOutput || [];

  if (Array.isArray(detalles)) {
    return detalles[0] || null;
  }

  return detalles || null;
}

function pagoOneclickAprobado(response) {
  const detalle = obtenerDetalleOneclick(response);

  const responseCode =
    detalle?.response_code ??
    detalle?.responseCode ??
    response.response_code ??
    response.responseCode;

  const status = detalle?.status ?? response.status;

  return responseCode === 0 || status === "AUTHORIZED";
}

function obtenerCodigoAutorizacionOneclick(response) {
  const detalle = obtenerDetalleOneclick(response);

  return (
    detalle?.authorization_code ??
    detalle?.authorizationCode ??
    response.authorization_code ??
    response.authorizationCode ??
    null
  );
}



function generarOrdenCompra(pedidoId) {
  const timestamp = Date.now().toString().slice(-8);
  return `ECONNET-${pedidoId}-${timestamp}`;
}

function obtenerPedidoIdDesdeOrdenCompra(buyOrder = "") {
  const partes = buyOrder.split("-");

  if (partes.length < 3) {
    return null;
  }

  const pedidoId = Number(partes[1]);

  return Number.isNaN(pedidoId) ? null : pedidoId;
}

async function restaurarStockPedido(tx, pedido) {
  if (pedido.stockRestaurado) {
    return;
  }

  for (const item of pedido.items) {
    await tx.producto.update({
      where: {
        id: item.productoId,
      },
      data: {
        stock: {
          increment: item.cantidad,
        },
      },
    });
  }
}

function crearSeguimientoEstado(estado, detalleExtra = "") {
  const infoEstado = obtenerInfoEstadoPedido(estado);

  return {
    estado,
    titulo: infoEstado.titulo,
    detalle: detalleExtra || infoEstado.detalle,
  };
}


function enviarDocumentoPagoEnSegundoPlano(pedidoId) {
  if (process.env.EMAIL_ENABLED !== "true") {
    console.log(
      `Envío de correo desactivado temporalmente para el pedido ${pedidoId}`,
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
      /*
       * El pago ya está aprobado.
       * Un error de correo no debe cambiar el estado del pago
       * ni impedir la redirección del cliente.
       */
      console.error(
        `No se pudo enviar el documento del pedido ${pedidoId}:`,
        error.message,
      );
    });
}

async function cancelarPedidoWebpay({ tokenPago, ordenCompraPago, estadoPago }) {
  const pedido = await prisma.pedido.findFirst({
    where: {
      OR: [
        tokenPago ? { tokenPago } : undefined,
        ordenCompraPago ? { ordenCompraPago } : undefined,
      ].filter(Boolean),
    },
    include: {
      items: true,
    },
  });

  if (!pedido) {
    return null;
  }

  if (pedido.estadoPago !== "pendiente") {
    return pedido;
  }

  const detalle =
    estadoPago === "rechazado"
      ? "El pago fue rechazado por Webpay."
      : "El usuario anuló el pago en Webpay.";

  const pedidoActualizado = await prisma.$transaction(async (tx) => {
    await restaurarStockPedido(tx, pedido);

    return tx.pedido.update({
      where: {
        id: pedido.id,
      },
      data: {
        estado: "cancelado",
        estadoPago,
        stockRestaurado: true,
        seguimientos: {
          create: crearSeguimientoEstado("cancelado", detalle),
        },
      },
    });
  });

  return pedidoActualizado;
}

export async function crearPagoWebpay(req, res) {
  try {
    const { pedidoId } = req.body;

    if (!pedidoId) {
      return res.status(400).json({
        ok: false,
        mensaje: "El pedidoId es obligatorio",
      });
    }

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

    if (pedido.estadoPago === "aprobado") {
      return res.status(400).json({
        ok: false,
        mensaje: "Este pedido ya tiene un pago aprobado",
      });
    }

    const tx = crearTransaccionWebpay();

    const buyOrder = generarOrdenCompra(pedido.id);
    const sessionId = pedido.usuarioId
      ? `usuario-${pedido.usuarioId}`
      : `invitado-${pedido.id}`;

    const amount = pedido.total;

    const returnUrl =
      process.env.WEBPAY_RETURN_URL ||
      "http://localhost:3000/api/pagos/webpay/retorno";

    const response = await tx.create(buyOrder, sessionId, amount, returnUrl);

    await prisma.pedido.update({
      where: {
        id: pedido.id,
      },
      data: {
        metodoPago: "webpay",
        estado: "pendiente",
        estadoPago: "pendiente",
        ordenCompraPago: buyOrder,
        tokenPago: response.token,
      },
    });

    return res.json({
      ok: true,
      mensaje: "Transacción Webpay creada correctamente",
      data: {
        token: response.token,
        url: response.url,
        buyOrder,
      },
    });
  } catch (error) {
    console.error("Error al crear pago Webpay:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error al crear pago Webpay",
      error: error.message,
    });
  }
}

export async function retornoWebpay(req, res) {
  const frontendUrl = (
    process.env.FRONTEND_URL || "http://localhost:5173"
  )
    .trim()
    .replace(/\/+$/, "");

  try {
    const token = req.body?.token_ws || req.query?.token_ws;

    const tokenCancelado =
      req.body?.TBK_TOKEN ||
      req.query?.TBK_TOKEN ||
      req.body?.tbk_token ||
      req.query?.tbk_token;

    const ordenCancelada =
      req.body?.TBK_ORDEN_COMPRA ||
      req.query?.TBK_ORDEN_COMPRA ||
      req.body?.tbk_orden_compra ||
      req.query?.tbk_orden_compra;

    if (!token) {
      if (tokenCancelado || ordenCancelada) {
        await cancelarPedidoWebpay({
          tokenPago: tokenCancelado,
          ordenCompraPago: ordenCancelada,
          estadoPago: "cancelado",
        });
      }

      return res.redirect(`${frontendUrl}/carrito?error=webpay_cancelado`);
    }

    const tx = crearTransaccionWebpay();

    const response = await tx.commit(token);

    console.log("Respuesta Webpay:", response);

    const buyOrder =
      response.buy_order ||
      response.buyOrder ||
      response.buy_order_webpay;

    const responseCode =
      response.response_code ??
      response.responseCode;

    const authorizationCode =
      response.authorization_code ||
      response.authorizationCode ||
      null;

    const pedidoId = obtenerPedidoIdDesdeOrdenCompra(buyOrder);

    if (!pedidoId) {
      return res.redirect(
        `${frontendUrl}/carrito?error=pedido_no_identificado`
      );
    }

    const pedido = await prisma.pedido.findUnique({
      where: {
        id: pedidoId,
      },
      include: {
        items: true,
      },
    });

    if (!pedido) {
      return res.redirect(`${frontendUrl}/carrito?error=pedido_no_encontrado`);
    }

    if (responseCode === 0) {
      if (pedido.estadoPago !== "aprobado") {
        await prisma.$transaction(async (txPrisma) => {
          await txPrisma.pedido.update({
            where: {
              id: pedidoId,
            },
            data: {
              estado: "confirmado",
              estadoPago: "aprobado",
              tokenPago: token,
              ordenCompraPago: buyOrder,
              codigoAutorizacion: authorizationCode,
              fechaPago: new Date(),
              seguimientos: {
                create: crearSeguimientoEstado(
                  "confirmado",
                  "Pago aprobado correctamente por Webpay.",
                ),
              },
            },
          });

          if (pedido.usuarioId && pedido.descuento > 0) {
            await txPrisma.usuario.update({
              where: {
                id: pedido.usuarioId,
              },
              data: {
                descuentoBienvenidaDisponible: false,
                descuentoBienvenidaUsado: true,
              },
            });

            await txPrisma.newsletterSuscriptor.updateMany({
              where: {
                email: pedido.emailCliente,
              },
              data: {
                usado: true,
              },
            });
          }

          if (pedido.usuarioId) {
            await txPrisma.carritoItem.deleteMany({
              where: {
                usuarioId: pedido.usuarioId,
              },
            });
          }
        });
      }

      enviarDocumentoPagoEnSegundoPlano(pedidoId);

      return res.redirect(
        `${frontendUrl}/compra-exitosa?pedidoId=${pedidoId}&orden=${buyOrder}`,
      );
    }

    await cancelarPedidoWebpay({
      tokenPago: token,
      ordenCompraPago: buyOrder,
      estadoPago: "rechazado",
    });

    return res.redirect(
      `${frontendUrl}/carrito?error=pago_rechazado&pedidoId=${pedidoId}`
    );
  } catch (error) {
    console.error("Error en retorno Webpay:", error);

    return res.redirect(`${frontendUrl}/carrito?error=webpay_error`);
  }
}

export async function crearPagoOneclick(req, res) {
  try {
    const { pedidoId, medioPagoId } = req.body;

    if (!pedidoId || !medioPagoId) {
      return res.status(400).json({
        ok: false,
        mensaje: "El pedidoId y medioPagoId son obligatorios",
      });
    }

    const pedido = await prisma.pedido.findFirst({
      where: {
        id: Number(pedidoId),
        usuarioId: req.usuario.id,
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

    if (pedido.total <= 0) {
      return res.status(400).json({
        ok: false,
        mensaje: "El total del pedido debe ser mayor a 0",
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

    const medioPago = await prisma.medioPago.findFirst({
      where: {
        id: Number(medioPagoId),
        usuarioId: req.usuario.id,
        activo: true,
      },
    });

    if (!medioPago) {
      return res.status(404).json({
        ok: false,
        mensaje: "Medio de pago no encontrado",
      });
    }

    const tx = crearTransaccionOneclick();

    const buyOrder = generarOrdenCompraOneclick(pedido.id);
    const childBuyOrder = generarOrdenCompraHijaOneclick(pedido.id);
    const commerceCodeHijo = obtenerCommerceCodeHijoOneclick();
    const amount = pedido.total;

    const details = [
      new TransactionDetail(amount, commerceCodeHijo, childBuyOrder),
    ];

    const response = await tx.authorize(
      medioPago.username,
      medioPago.tbkUser,
      buyOrder,
      details
    );

    console.log("Respuesta Oneclick:", response);

    const aprobado = pagoOneclickAprobado(response);
    const codigoAutorizacion = obtenerCodigoAutorizacionOneclick(response);

    if (!aprobado) {
      const pedidoCancelado = await prisma.$transaction(async (txPrisma) => {
        await restaurarStockPedido(txPrisma, pedido);

        return txPrisma.pedido.update({
          where: {
            id: pedido.id,
          },
          data: {
            metodoPago: "oneclick",
            estado: "cancelado",
            estadoPago: "rechazado",
            stockRestaurado: true,
            ordenCompraPago: buyOrder,
            codigoAutorizacion,
            seguimientos: {
              create: crearSeguimientoEstado(
                "cancelado",
                "El pago fue rechazado por Oneclick."
              ),
            },
          },
        });
      });

      return res.status(400).json({
        ok: false,
        mensaje: "El pago con Oneclick fue rechazado",
        data: {
          pedido: pedidoCancelado,
          response,
        },
      });
    }

    const pedidoActualizado = await prisma.$transaction(async (txPrisma) => {
      const actualizado = await txPrisma.pedido.update({
        where: {
          id: pedido.id,
        },
        data: {
          metodoPago: "oneclick",
          estado: "confirmado",
          estadoPago: "aprobado",
          ordenCompraPago: buyOrder,
          codigoAutorizacion,
          fechaPago: new Date(),
          seguimientos: {
            create: crearSeguimientoEstado(
              "confirmado",
              "Pago aprobado correctamente con tarjeta guardada Oneclick."
            ),
          },
        },
        include: {
          items: true,
          direccion: true,
          seguimientos: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

      if (pedido.descuento > 0) {
        await txPrisma.usuario.update({
          where: {
            id: pedido.usuarioId,
          },
          data: {
            descuentoBienvenidaDisponible: false,
            descuentoBienvenidaUsado: true,
          },
        });

        await txPrisma.newsletterSuscriptor.updateMany({
          where: {
            email: pedido.emailCliente,
          },
          data: {
            usado: true,
          },
        });
      }

      await txPrisma.carritoItem.deleteMany({
        where: {
          usuarioId: pedido.usuarioId,
        },
      });

      return actualizado;
    });


    enviarDocumentoPagoEnSegundoPlano(pedido.id);

    return res.json({
      ok: true,
      mensaje: "Pago Oneclick aprobado correctamente",
      data: {
        pedido: pedidoActualizado,
        buyOrder,
        codigoAutorizacion,
      },
    });
  } catch (error) {
    console.error("Error al crear pago Oneclick:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error al procesar pago con Oneclick",
      error: error.message,
    });
  }
}