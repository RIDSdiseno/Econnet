import logger, { serializeError } from "../config/logger.js";
import prisma from "../config/prisma.js";
import { obtenerTarifaDespacho } from "../utils/despacho.js";

export const calcularDespachoPedido = async (req, res) => {
  try {
    const {
      tipoEntrega = "despacho",
      direccionId,
      region,
      comuna,
    } = req.query;

    if (tipoEntrega === "retiro") {
      return res.json({
        ok: true,
        despacho: {
          codigo: "RETIRO",
          nombre: "Retiro en tienda",
          precio: 0,
        },
      });
    }

    let direccion = null;

    if (direccionId) {
      if (!req.usuario) {
        return res.status(401).json({
          ok: false,
          mensaje: "Debes iniciar sesión para usar una dirección guardada",
        });
      }

      direccion = await prisma.direccion.findFirst({
        where: {
          id: Number(direccionId),
          usuarioId: req.usuario.id,
        },
      });

      if (!direccion) {
        return res.status(404).json({
          ok: false,
          mensaje: "Dirección no encontrada",
        });
      }
    } else {
      const regionInvitado = String(region || "").trim();
      const comunaInvitado = String(comuna || "").trim();

      if (!regionInvitado || !comunaInvitado) {
        return res.status(400).json({
          ok: false,
          mensaje: "Debes ingresar región y comuna para calcular el despacho",
        });
      }

      direccion = {
        region: regionInvitado,
        comuna: comunaInvitado,
      };
    }

    const tarifa = await obtenerTarifaDespacho(
      prisma,
      tipoEntrega,
      direccion,
    );

    return res.json({
      ok: true,
      despacho: tarifa,
    });
  } catch (error) {
    logger.error("Error al calcular despacho:", serializeError(error));

    return res.status(500).json({
      ok: false,
      mensaje: error.message || "Error al calcular despacho",
    });
  }
};