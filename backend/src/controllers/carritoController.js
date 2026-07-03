import logger, { serializeError } from "../config/logger.js";
import prisma from "../config/prisma.js";

const calcularResumenCarrito = (items) => {
  const cantidadProductos = items.reduce(
    (total, item) => total + item.cantidad,
    0,
  );

  const subtotal = items.reduce((total, item) => {
    return total + item.producto.precio * item.cantidad;
  }, 0);

  return {
    cantidadProductos,
    subtotal,
    descuento: 0,
    despacho: 0,
    total: subtotal,
  };
};

export const obtenerCarrito = async (req, res) => {
  try {
    const items = await prisma.carritoItem.findMany({
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
      items,
      resumen: calcularResumenCarrito(items),
    });
  } catch (error) {
    logger.error("Error al obtener carrito:", serializeError(error));

    res.status(500).json({
      ok: false,
      mensaje: "Error al obtener carrito",
      error: error.message,
    });
  }
};

export const agregarProductoCarrito = async (req, res) => {
  try {
    const { productoId } = req.params;
    const idProducto = Number(productoId);

    if (!idProducto) {
      return res.status(400).json({
        ok: false,
        mensaje: "ID de producto inválido",
      });
    }

    const producto = await prisma.producto.findFirst({
      where: {
        id: idProducto,
        activo: true,
      },
    });

    if (!producto) {
      return res.status(404).json({
        ok: false,
        mensaje: "Producto no encontrado",
      });
    }

    if (producto.stock <= 0) {
      return res.status(400).json({
        ok: false,
        mensaje: "Producto sin stock disponible",
      });
    }

    const itemExistente = await prisma.carritoItem.findUnique({
      where: {
        usuarioId_productoId: {
          usuarioId: req.usuario.id,
          productoId: idProducto,
        },
      },
    });

    if (itemExistente) {
      const nuevaCantidad = itemExistente.cantidad + 1;

      if (nuevaCantidad > producto.stock) {
        return res.status(400).json({
          ok: false,
          mensaje: "No hay stock suficiente para agregar más unidades",
        });
      }

      const itemActualizado = await prisma.carritoItem.update({
        where: {
          usuarioId_productoId: {
            usuarioId: req.usuario.id,
            productoId: idProducto,
          },
        },
        data: {
          cantidad: nuevaCantidad,
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

      return res.json({
        ok: true,
        mensaje: "Cantidad actualizada en el carrito",
        item: itemActualizado,
      });
    }

    const nuevoItem = await prisma.carritoItem.create({
      data: {
        usuarioId: req.usuario.id,
        productoId: idProducto,
        cantidad: 1,
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
      mensaje: "Producto agregado al carrito",
      item: nuevoItem,
    });
  } catch (error) {
    logger.error("Error al agregar producto al carrito:", serializeError(error));

    res.status(500).json({
      ok: false,
      mensaje: "Error al agregar producto al carrito",
      error: error.message,
    });
  }
};

export const actualizarCantidadCarrito = async (req, res) => {
  try {
    const { productoId } = req.params;
    const { cantidad } = req.body;

    const idProducto = Number(productoId);
    const nuevaCantidad = Number(cantidad);

    if (!idProducto) {
      return res.status(400).json({
        ok: false,
        mensaje: "ID de producto inválido",
      });
    }

    if (!nuevaCantidad || nuevaCantidad < 1) {
      return res.status(400).json({
        ok: false,
        mensaje: "La cantidad debe ser mayor a 0",
      });
    }

    const producto = await prisma.producto.findFirst({
      where: {
        id: idProducto,
        activo: true,
      },
    });

    if (!producto) {
      return res.status(404).json({
        ok: false,
        mensaje: "Producto no encontrado",
      });
    }

    if (nuevaCantidad > producto.stock) {
      return res.status(400).json({
        ok: false,
        mensaje: "No hay stock suficiente",
      });
    }

    const itemExiste = await prisma.carritoItem.findUnique({
      where: {
        usuarioId_productoId: {
          usuarioId: req.usuario.id,
          productoId: idProducto,
        },
      },
    });

    if (!itemExiste) {
      return res.status(404).json({
        ok: false,
        mensaje: "Producto no encontrado en el carrito",
      });
    }

    const itemActualizado = await prisma.carritoItem.update({
      where: {
        usuarioId_productoId: {
          usuarioId: req.usuario.id,
          productoId: idProducto,
        },
      },
      data: {
        cantidad: nuevaCantidad,
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

    res.json({
      ok: true,
      mensaje: "Cantidad actualizada",
      item: itemActualizado,
    });
  } catch (error) {
    logger.error("Error al actualizar cantidad:", serializeError(error));

    res.status(500).json({
      ok: false,
      mensaje: "Error al actualizar cantidad",
      error: error.message,
    });
  }
};

export const eliminarProductoCarrito = async (req, res) => {
  try {
    const { productoId } = req.params;
    const idProducto = Number(productoId);

    if (!idProducto) {
      return res.status(400).json({
        ok: false,
        mensaje: "ID de producto inválido",
      });
    }

    const itemExiste = await prisma.carritoItem.findUnique({
      where: {
        usuarioId_productoId: {
          usuarioId: req.usuario.id,
          productoId: idProducto,
        },
      },
    });

    if (!itemExiste) {
      return res.status(404).json({
        ok: false,
        mensaje: "Producto no encontrado en el carrito",
      });
    }

    await prisma.carritoItem.delete({
      where: {
        usuarioId_productoId: {
          usuarioId: req.usuario.id,
          productoId: idProducto,
        },
      },
    });

    res.json({
      ok: true,
      mensaje: "Producto eliminado del carrito",
    });
  } catch (error) {
    logger.error("Error al eliminar producto del carrito:", serializeError(error));

    res.status(500).json({
      ok: false,
      mensaje: "Error al eliminar producto del carrito",
      error: error.message,
    });
  }
};

export const vaciarCarrito = async (req, res) => {
  try {
    await prisma.carritoItem.deleteMany({
      where: {
        usuarioId: req.usuario.id,
      },
    });

    res.json({
      ok: true,
      mensaje: "Carrito vaciado correctamente",
    });
  } catch (error) {
    logger.error("Error al vaciar carrito:", serializeError(error));

    res.status(500).json({
      ok: false,
      mensaje: "Error al vaciar carrito",
      error: error.message,
    });
  }
};