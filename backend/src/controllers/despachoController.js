import prisma from "../config/prisma.js";
import { obtenerTarifaDespacho } from "../utils/despacho.js";

export const calcularDespachoPedido = async (req, res) => {
  try {
    const { tipoEntrega = "despacho", direccionId } = req.query;

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

    if (!direccionId) {
      return res.status(400).json({
        ok: false,
        mensaje: "Debes seleccionar una dirección",
      });
    }

    const direccion = await prisma.direccion.findFirst({
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

    const tarifa = await obtenerTarifaDespacho(
      prisma,
      tipoEntrega,
      direccion,
    );

    res.json({
      ok: true,
      despacho: tarifa,
    });
  } catch (error) {
    console.error("Error al calcular despacho:", error);

    res.status(500).json({
      ok: false,
      mensaje: error.message || "Error al calcular despacho",
    });
  }
};