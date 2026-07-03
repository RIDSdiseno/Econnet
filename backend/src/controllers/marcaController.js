import logger, { serializeError } from "../config/logger.js";
import prisma from "../config/prisma.js";

export const obtenerMarcas = async (req, res) => {
  try {
    const marcas = await prisma.marca.findMany({
      where: {
        activo: true,
      },
      orderBy: {
        nombre: "asc",
      },
    });

    res.json({
      ok: true,
      marcas,
    });
  } catch (error) {
    logger.error("Error al obtener marcas:", serializeError(error));

    res.status(500).json({
      ok: false,
      mensaje: "Error al obtener marcas",
    });
  }
};

export const obtenerMarcaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const marca = await prisma.marca.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        productos: true,
      },
    });

    if (!marca) {
      return res.status(404).json({
        ok: false,
        mensaje: "Marca no encontrada",
      });
    }

    res.json({
      ok: true,
      marca,
    });
  } catch (error) {
    logger.error("Error al obtener marca:", serializeError(error));

    res.status(500).json({
      ok: false,
      mensaje: "Error al obtener la marca",
    });
  }
};


export const obtenerMarcasHome = async (req, res) => {
    try {
        const marcas = await prisma.marca.findMany({
            where: {
                activo: true,
                mostrarHome: true,
            },
            orderBy: [
                {
                    orden: "asc",
                },
                {
                    id: "asc",
                },
            ],
        });

        return res.json({
            ok: true,
            marcas,
        });
    } catch (error) {
        logger.error("Error al obtener marcas del home:", serializeError(error));

        return res.status(500).json({
            ok: false,
            mensaje: "Error al obtener marcas del home",
        });
    }
};