import prisma from "../config/prisma.js";

export const obtenerFavoritos = async (req, res) => {
  try {
    const favoritos = await prisma.favorito.findMany({
      where: {
        usuarioId: req.usuario.id,
      },
      include: {
        producto: {
          include: {
            categoria: true,
            marca: true,
            imagenes: {
              orderBy: {
                orden: "asc",
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      ok: true,
      favoritos,
    });
  } catch (error) {
    console.error("Error al obtener favoritos:", error);

    res.status(500).json({
      ok: false,
      mensaje: "Error al obtener favoritos",
      error: error.message,
    });
  }
};

export const agregarFavorito = async (req, res) => {
  try {
    const { productoId } = req.params;
    const idProducto = Number(productoId);

    if (!idProducto) {
      return res.status(400).json({
        ok: false,
        mensaje: "ID de producto inválido",
      });
    }

    const productoExiste = await prisma.producto.findFirst({
      where: {
        id: idProducto,
        activo: true,
      },
    });

    if (!productoExiste) {
      return res.status(404).json({
        ok: false,
        mensaje: "Producto no encontrado",
      });
    }

    const favoritoExiste = await prisma.favorito.findUnique({
      where: {
        usuarioId_productoId: {
          usuarioId: req.usuario.id,
          productoId: idProducto,
        },
      },
    });

    if (favoritoExiste) {
      return res.status(400).json({
        ok: false,
        mensaje: "Este producto ya está en favoritos",
      });
    }

    const favorito = await prisma.favorito.create({
      data: {
        usuarioId: req.usuario.id,
        productoId: idProducto,
      },
      include: {
        producto: {
          include: {
            categoria: true,
            marca: true,
            imagenes: {
              orderBy: {
                orden: "asc",
              },
            },
          },
        },
      },
    });

    res.status(201).json({
      ok: true,
      mensaje: "Producto agregado a favoritos",
      favorito,
    });
  } catch (error) {
    console.error("Error al agregar favorito:", error);

    res.status(500).json({
      ok: false,
      mensaje: "Error al agregar favorito",
      error: error.message,
    });
  }
};

export const eliminarFavorito = async (req, res) => {
  try {
    const { productoId } = req.params;
    const idProducto = Number(productoId);

    if (!idProducto) {
      return res.status(400).json({
        ok: false,
        mensaje: "ID de producto inválido",
      });
    }

    const favoritoExiste = await prisma.favorito.findUnique({
      where: {
        usuarioId_productoId: {
          usuarioId: req.usuario.id,
          productoId: idProducto,
        },
      },
    });

    if (!favoritoExiste) {
      return res.status(404).json({
        ok: false,
        mensaje: "Favorito no encontrado",
      });
    }

    await prisma.favorito.delete({
      where: {
        usuarioId_productoId: {
          usuarioId: req.usuario.id,
          productoId: idProducto,
        },
      },
    });

    res.json({
      ok: true,
      mensaje: "Producto eliminado de favoritos",
    });
  } catch (error) {
    console.error("Error al eliminar favorito:", error);

    res.status(500).json({
      ok: false,
      mensaje: "Error al eliminar favorito",
      error: error.message,
    });
  }
};