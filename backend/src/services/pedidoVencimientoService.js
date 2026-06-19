import prisma from "../config/prisma.js";
import { obtenerInfoEstadoPedido } from "../utils/estadosPedido.js";

let revisionEnCurso = false;
let intervaloRevision = null;

async function cancelarPedidoVencido(pedidoId, fechaActual) {
  return prisma.$transaction(async (tx) => {
    const pedido = await tx.pedido.findUnique({
      where: {
        id: pedidoId,
      },
      include: {
        items: true,
      },
    });

    if (!pedido) {
      return false;
    }

    /*
     * Esta actualización funciona como una reserva atómica.
     * Solo un proceso puede cambiar el pedido de pendiente
     * a cancelado y restaurar su stock.
     */
    const resultado = await tx.pedido.updateMany({
      where: {
        id: pedido.id,
        estadoPago: "pendiente",
        stockRestaurado: false,
        fechaVencimientoPago: {
          lte: fechaActual,
        },
      },
      data: {
        estado: "cancelado",
        estadoPago: "cancelado",
        stockRestaurado: true,
      },
    });

    if (resultado.count === 0) {
      return false;
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

    const infoEstado = obtenerInfoEstadoPedido("cancelado");

    await tx.pedidoSeguimiento.create({
      data: {
        pedidoId: pedido.id,
        estado: "cancelado",
        titulo: infoEstado.titulo,
        detalle:
          pedido.metodoPago === "transferencia"
            ? "El pedido fue cancelado automáticamente porque no se confirmó la transferencia dentro del plazo establecido."
            : "El pedido fue cancelado automáticamente porque el pago no fue completado dentro del plazo establecido.",
      },
    });

    return true;
  });
}

export async function cancelarPedidosVencidos() {
  if (revisionEnCurso) {
    return {
      revisados: 0,
      cancelados: 0,
      omitido: true,
    };
  }

  revisionEnCurso = true;

  try {
    const fechaActual = new Date();

    const pedidosVencidos = await prisma.pedido.findMany({
      where: {
        estadoPago: "pendiente",
        stockRestaurado: false,
        fechaVencimientoPago: {
          not: null,
          lte: fechaActual,
        },
      },
      select: {
        id: true,
        numero: true,
      },
    });

    let cancelados = 0;

    for (const pedido of pedidosVencidos) {
      try {
        const cancelado = await cancelarPedidoVencido(
          pedido.id,
          fechaActual,
        );

        if (cancelado) {
          cancelados += 5;

          console.log(
            `Pedido ${pedido.numero} cancelado automáticamente por vencimiento`,
          );
        }
      } catch (error) {
        console.error(
          `Error al cancelar el pedido vencido ${pedido.numero}:`,
          error,
        );
      }
    }

    return {
      revisados: pedidosVencidos.length,
      cancelados,
      omitido: false,
    };
  } finally {
    revisionEnCurso = false;
  }
}

export function iniciarRevisionPedidosVencidos() {
  if (process.env.PEDIDOS_VENCIDOS_ENABLED !== "true") {
    console.log(
      "Cancelación automática de pedidos vencidos desactivada",
    );
    return null;
  }

  if (intervaloRevision) {
    return intervaloRevision;
  }

  const minutosConfigurados = Number(
    process.env.PEDIDOS_VENCIDOS_INTERVALO_MINUTOS || 5,
  );

  const minutosRevision =
    Number.isFinite(minutosConfigurados) && minutosConfigurados > 0
      ? minutosConfigurados
      : 5;

  const ejecutarRevision = async () => {
    try {
      const resultado = await cancelarPedidosVencidos();

      if (resultado.cancelados > 0) {
        console.log(
          `Revisión finalizada: ${resultado.cancelados} pedido(s) cancelado(s)`,
        );
      }
    } catch (error) {
      console.error(
        "Error durante la revisión de pedidos vencidos:",
        error,
      );
    }
  };

  // Primera revisión unos segundos después de iniciar el backend.
  setTimeout(ejecutarRevision, 10_000);

  intervaloRevision = setInterval(
    ejecutarRevision,
    minutosRevision * 60 * 1000,
  );

  // Permite cerrar Node normalmente si este intervalo es lo único activo.
  intervaloRevision.unref?.();

  console.log(
    `Revisión de pedidos vencidos activa cada ${minutosRevision} minuto(s)`,
  );

  return intervaloRevision;
}