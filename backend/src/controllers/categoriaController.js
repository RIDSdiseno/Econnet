import logger, { serializeError } from "../config/logger.js";
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
    logger.error("Error al obtener categorías:", serializeError(error));

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
    logger.error("Error al obtener categoría:", serializeError(error));

    res.status(500).json({
      ok: false,
      mensaje: "Error al obtener la categoría",
    });
  }
};

export const editarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const categoriaId = Number(id);

    const { nombre, slug, descripcion, imagenUrl, activo } = req.body;

    if (!categoriaId) {
      return res.status(400).json({
        ok: false,
        mensaje: "ID de categoría inválido",
      });
    }

    const categoriaExiste = await prisma.categoria.findUnique({
      where: {
        id: categoriaId,
      },
    });

    if (!categoriaExiste) {
      return res.status(404).json({
        ok: false,
        mensaje: "Categoría no encontrada",
      });
    }

    const categoriaActualizada = await prisma.categoria.update({
      where: {
        id: categoriaId,
      },
      data: {
        nombre: nombre !== undefined ? nombre : undefined,
        slug: slug !== undefined ? slug : undefined,
        descripcion: descripcion !== undefined ? descripcion : undefined,
        imagenUrl: imagenUrl !== undefined ? imagenUrl : undefined,
        activo: activo !== undefined ? activo : undefined,
      },
    });

    res.json({
      ok: true,
      mensaje: "Categoría actualizada correctamente",
      categoria: categoriaActualizada,
    });
  } catch (error) {
    logger.error("Error al editar categoría:", serializeError(error));

    res.status(500).json({
      ok: false,
      mensaje: "Error al editar categoría",
      error: error.message,
    });
  }
};