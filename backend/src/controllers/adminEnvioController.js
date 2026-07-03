import logger, { serializeError } from "../config/logger.js";
import prisma from "../config/prisma.js";
import { crearEnvioBlueExpress } from "../services/blueExpressService.js";

function numeroEntero(valor, defecto) {
  const numero = Number(valor);

  if (!Number.isInteger(numero) || numero <= 0) {
    return defecto;
  }

  return numero;
}

async function usuarioEsAdmin(usuarioId) {
  if (!usuarioId) {
    return false;
  }

  const usuario = await prisma.usuario.findUnique({
    where: {
      id: usuarioId,
    },
    select: {
      rol: true,
      activo: true,
    },
  });

  return usuario?.activo === true && usuario?.rol === "admin";
}

function obtenerDestinoPedido(pedido) {
  return {
    nombre: pedido.nombreCliente,
    email: pedido.emailCliente,
    telefono: pedido.telefonoCliente || "",
    direccion: pedido.direccionTexto || pedido.direccion?.direccion || "",
    comuna: pedido.comuna || pedido.direccion?.comuna || "",
    region: pedido.region || pedido.direccion?.region || "",
  };
}

function obtenerOrigenEnvio() {
  return {
    nombre: process.env.ECONNET_ORIGEN_NOMBRE || "Econnet",
    direccion:
      process.env.ECONNET_ORIGEN_DIRECCION ||
      "Dirección de origen pendiente",
    comuna: process.env.ECONNET_ORIGEN_COMUNA || "Santiago",
    region: process.env.ECONNET_ORIGEN_REGION || "Región Metropolitana",
  };
}

export const obtenerEnviosPedidoAdmin = async (req, res) => {
  try {
    const esAdmin = await usuarioEsAdmin(req.usuario?.id);

    if (!esAdmin) {
      return res.status(403).json({
        ok: false,
        mensaje: "No tienes permisos para ver envíos",
      });
    }

    const pedidoId = Number(req.params.pedidoId);

    if (!pedidoId) {
      return res.status(400).json({
        ok: false,
        mensaje: "ID de pedido inválido",
      });
    }

    const envios = await prisma.envioPedido.findMany({
      where: {
        pedidoId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({
      ok: true,
      envios,
    });
  } catch (error) {
    logger.error("Error al obtener envíos del pedido:", serializeError(error));

    return res.status(500).json({
      ok: false,
      mensaje: "No se pudieron obtener los envíos del pedido",
    });
  }
};

export const generarEnvioBlueExpressAdmin = async (req, res) => {
  try {
    const esAdmin = await usuarioEsAdmin(req.usuario?.id);

    if (!esAdmin) {
      return res.status(403).json({
        ok: false,
        mensaje: "No tienes permisos para generar envíos",
      });
    }

    const pedidoId = Number(req.params.pedidoId);

    if (!pedidoId) {
      return res.status(400).json({
        ok: false,
        mensaje: "ID de pedido inválido",
      });
    }

    const {
      pesoGramos,
      altoCm,
      anchoCm,
      largoCm,
      servicio,
    } = req.body || {};

    const paquete = {
      pesoGramos: numeroEntero(pesoGramos, 1000),
      altoCm: numeroEntero(altoCm, 10),
      anchoCm: numeroEntero(anchoCm, 20),
      largoCm: numeroEntero(largoCm, 30),
    };

    const pedido = await prisma.pedido.findUnique({
      where: {
        id: pedidoId,
      },
      include: {
        usuario: true,
        direccion: true,
        items: {
          include: {
            producto: {
              select: {
                sku: true,
              },
            },
          },
        },
        envios: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!pedido) {
      return res.status(404).json({
        ok: false,
        mensaje: "Pedido no encontrado",
      });
    }

    if (pedido.estadoPago !== "aprobado") {
      return res.status(400).json({
        ok: false,
        mensaje: "Solo puedes generar envío para pedidos pagados",
      });
    }

    if (pedido.tipoEntrega !== "despacho") {
      return res.status(400).json({
        ok: false,
        mensaje: "Este pedido es retiro en tienda, no requiere Blue Express",
      });
    }

    if (pedido.estado === "cancelado") {
      return res.status(400).json({
        ok: false,
        mensaje: "No puedes generar envío para un pedido cancelado",
      });
    }

    const destino = obtenerDestinoPedido(pedido);

    if (!destino.direccion || !destino.comuna) {
      return res.status(400).json({
        ok: false,
        mensaje:
          "El pedido no tiene dirección o comuna suficiente para generar envío",
      });
    }

    const envioActivo = pedido.envios.find(
      (envio) =>
        envio.courier === "blue_express" &&
        !["cancelado", "error"].includes(envio.estado),
    );

    if (envioActivo) {
      return res.status(409).json({
        ok: false,
        mensaje: "Este pedido ya tiene un envío Blue Express generado",
        envio: envioActivo,
      });
    }

    const respuestaBlueExpress = await crearEnvioBlueExpress(pedido, paquete);

    const origen = obtenerOrigenEnvio();

    const envio = await prisma.$transaction(async (tx) => {
      const envioCreado = await tx.envioPedido.create({
        data: {
          pedidoId: pedido.id,
          courier: "blue_express",
          estado: respuestaBlueExpress.estado || "generado",
          servicio:
            servicio ||
            respuestaBlueExpress.servicio ||
            "Blue Express Ecommerce",

          ordenServicio: respuestaBlueExpress.ordenServicio,
          numeroSeguimiento: respuestaBlueExpress.numeroSeguimiento,
          urlSeguimiento: respuestaBlueExpress.urlSeguimiento,
          etiquetaUrl: respuestaBlueExpress.etiquetaUrl,

          costo: respuestaBlueExpress.costo ?? pedido.despacho ?? 0,

          pesoGramos: paquete.pesoGramos,
          altoCm: paquete.altoCm,
          anchoCm: paquete.anchoCm,
          largoCm: paquete.largoCm,

          origenNombre: origen.nombre,
          origenDireccion: origen.direccion,
          origenComuna: origen.comuna,
          origenRegion: origen.region,

          destinoNombre: destino.nombre,
          destinoEmail: destino.email,
          destinoTelefono: destino.telefono,
          destinoDireccion: destino.direccion,
          destinoComuna: destino.comuna,
          destinoRegion: destino.region,

          respuestaCourier: respuestaBlueExpress.respuestaOriginal || {},
          fechaGeneracion: new Date(),
        },
      });

      await tx.pedidoSeguimiento.create({
        data: {
          pedidoId: pedido.id,
          estado: "empaquetando",
          titulo: "Envío Blue Express generado",
          detalle: envioCreado.numeroSeguimiento
            ? `Se generó el envío Blue Express. Número de seguimiento: ${envioCreado.numeroSeguimiento}`
            : "Se generó el envío Blue Express.",
        },
      });

      return envioCreado;
    });

    return res.status(201).json({
      ok: true,
      mensaje: "Envío Blue Express generado correctamente",
      envio,
    });
  } catch (error) {
    logger.error("Error al generar envío Blue Express:", serializeError(error));

    return res.status(500).json({
      ok: false,
      mensaje: error.message || "No se pudo generar el envío Blue Express",
    });
  }
};