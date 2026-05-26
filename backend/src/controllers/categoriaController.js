import prisma from "../config/prisma.js";

export const obtenerCategorias = async (req, res) => {
  try {
    const categorias = await prisma.categoria.findMany({
      where: {
        activo: true,
      },
      orderBy: {
        nombre: "asc",
      },
    });

    res.json({
      ok: true,
      categorias,
    });
  } catch (error) {
    console.error("Error al obtener categorías:", error);

    res.status(500).json({
      ok: false,
      mensaje: "Error al obtener categorías",
    });
  }
};

export const obtenerCategoriaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const categoria = await prisma.categoria.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        productos: true,
      },
    });

    if (!categoria) {
      return res.status(404).json({
        ok: false,
        mensaje: "Categoría no encontrada",
      });
    }

    res.json({
      ok: true,
      categoria,
    });
  } catch (error) {
    console.error("Error al obtener categoría:", error);

    res.status(500).json({
      ok: false,
      mensaje: "Error al obtener la categoría",
    });
  }
};