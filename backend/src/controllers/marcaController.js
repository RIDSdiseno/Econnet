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
    console.error("Error al obtener marcas:", error);

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
    console.error("Error al obtener marca:", error);

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
        console.error("Error al obtener marcas del home:", error);

        return res.status(500).json({
            ok: false,
            mensaje: "Error al obtener marcas del home",
        });
    }
};