import prisma from "../config/prisma.js";
import { obtenerTarifaDespacho } from "../utils/despacho.js";
import {
  obtenerInfoEstadoPedido,
  estadoPedidoValido,
} from "../utils/estadosPedido.js";

const generarNumeroPedido = () => {
  const fecha = new Date();
  const year = fecha.getFullYear();
  const timestamp = Date.now();

  return `EC-${year}-${timestamp}`;
};

const obtenerImagenPrincipal = (producto) => {
  const imagenPrincipal =
    producto.imagenes?.find((imagen) => imagen.esPrincipal) ||
    producto.imagenes?.find((imagen) => imagen.tipo !== "oferta_wide") ||
    producto.imagenes?.[0];

  return imagenPrincipal?.url || null;
};

export const crearPedido = async (req, res) => {
  try {
    const {
      direccionId,
      tipoEntrega = "despacho",
      metodoPago = "transferencia",
      documento = "boleta",
    } = req.body;

    if (tipoEntrega === "despacho" && !direccionId) {
      return res.status(400).json({
        ok: false,
        mensaje: "Debes seleccionar una dirección de despacho",
      });
    }

    const pedido = await prisma.$transaction(async (tx) => {
      const usuario = await tx.usuario.findUnique({
        where: {
          id: req.usuario.id,
        },
        select: {
          id: true,
          nombre: true,
          email: true,
          telefono: true,
        },
      });

      if (!usuario) {
        throw new Error("Usuario no encontrado");
      }

      let direccionSeleccionada = null;

      if (tipoEntrega === "despacho") {
        direccionSeleccionada = await tx.direccion.findFirst({
          where: {
            id: Number(direccionId),
            usuarioId: req.usuario.id,
          },
        });

        if (!direccionSeleccionada) {
          throw new Error("Dirección no encontrada");
        }
      }

      const itemsCarrito = await tx.carritoItem.findMany({
        where: {
          usuarioId: req.usuario.id,
        },
        include: {
          producto: {
            include: {
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

      if (itemsCarrito.length === 0) {
        throw new Error("El carrito está vacío");
      }

      for (const item of itemsCarrito) {
        if (!item.producto.activo) {
          throw new Error(`El producto ${item.producto.nombre} no está disponible`);
        }

        if (item.cantidad > item.producto.stock) {
          throw new Error(
            `No hay stock suficiente para ${item.producto.nombre}`,
          );
        }
      }

      const subtotal = itemsCarrito.reduce((total, item) => {
        return total + item.producto.precio * item.cantidad;
      }, 0);

      const pedidosPrevios = await tx.pedido.count({
        where: {
          usuarioId: req.usuario.id,
        },
      });

      const aplicaDescuentoNuevo = pedidosPrevios === 0;

      const descuento = aplicaDescuentoNuevo ? Math.round(subtotal * 0.1) : 0;

      const tarifaDespacho = await obtenerTarifaDespacho(
        tx,
        tipoEntrega,
        direccionSeleccionada,
      );
      

      const despacho = tarifaDespacho.precio;
      const total = subtotal - descuento + despacho;

      const estadoInicial = obtenerInfoEstadoPedido("pendiente");
      const nuevoPedido = await tx.pedido.create({
        data: {
          usuarioId: req.usuario.id,
          direccionId:
            tipoEntrega === "despacho" ? Number(direccionId) : null,

          numero: generarNumeroPedido(),
          estado: "pendiente",

          tipoEntrega,
          metodoPago,
          documento,

          nombreCliente: usuario.nombre,
          emailCliente: usuario.email,
          telefonoCliente: usuario.telefono,

          direccionTexto: direccionSeleccionada?.direccion || null,
          region: direccionSeleccionada?.region || null,
          comuna: direccionSeleccionada?.comuna || null,

          subtotal,
          descuento,
          despacho,
          total,

          items: {
            create: itemsCarrito.map((item) => ({
              productoId: item.productoId,
              nombreProducto: item.producto.nombre,
              marcaProducto: item.producto.marca?.nombre || null,
              imagenUrl: obtenerImagenPrincipal(item.producto),
              precioUnitario: item.producto.precio,
              cantidad: item.cantidad,
              subtotal: item.producto.precio * item.cantidad,
            })),
          },

          seguimientos: {
            create: [
              {
                estado: estadoInicial.estado,
                titulo: estadoInicial.titulo,
                detalle: estadoInicial.detalle,
              },
            ],
          },

        },
        include: {
          items: true,
          direccion: true,
          seguimientos: {
            orderBy: {
              createdAt: "asc",
            },
          }
        },
      });

      for (const item of itemsCarrito) {
        await tx.producto.update({
          where: {
            id: item.productoId,
          },
          data: {
            stock: {
              decrement: item.cantidad,
            },
          },
        });
      }

      await tx.carritoItem.deleteMany({
        where: {
          usuarioId: req.usuario.id,
        },
      });

      return nuevoPedido;
    });

    res.status(201).json({
      ok: true,
      mensaje: "Pedido creado correctamente",
      pedido,
    });
  } catch (error) {
    console.error("Error al crear pedido:", error);

    res.status(500).json({
      ok: false,
      mensaje: error.message || "Error al crear pedido",
    });
  }
};

export const obtenerPedidos = async (req, res) => {
  try {
    const pedidos = await prisma.pedido.findMany({
      where: {
        usuarioId: req.usuario.id,
      },
      include: {
        items: true,
        direccion: true,
        seguimientos: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      ok: true,
      pedidos,
    });
  } catch (error) {
    console.error("Error al obtener pedidos:", error);

    res.status(500).json({
      ok: false,
      mensaje: "Error al obtener pedidos",
      error: error.message,
    });
  }
};

export const obtenerPedidoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const pedidoId = Number(id);

    if (!pedidoId) {
      return res.status(400).json({
        ok: false,
        mensaje: "ID de pedido inválido",
      });
    }

    const pedido = await prisma.pedido.findFirst({
      where: {
        id: pedidoId,
        usuarioId: req.usuario.id,
      },
      include: {
        items: true,
        direccion: true,
        seguimientos: {
          orderBy: {
            createdAt: "asc",
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

    res.json({
      ok: true,
      pedido,
    });
  } catch (error) {
    console.error("Error al obtener pedido:", error);

    res.status(500).json({
      ok: false,
      mensaje: "Error al obtener pedido",
      error: error.message,
    });
  }
};


export const actualizarEstadoPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, detalle } = req.body;

    const pedidoId = Number(id);

    if (!pedidoId) {
      return res.status(400).json({
        ok: false,
        mensaje: "ID de pedido inválido",
      });
    }

    if (!estadoPedidoValido(estado)) {
      return res.status(400).json({
        ok: false,
        mensaje: "Estado de pedido inválido",
      });
    }

    const usuarioActual = await prisma.usuario.findUnique({
      where: {
        id: req.usuario.id,
      },
      select: {
        rol: true,
      },
    });

    if (!usuarioActual || usuarioActual.rol !== "admin") {
      return res.status(403).json({
        ok: false,
        mensaje: "No tienes permisos para actualizar pedidos",
      });
    }

    const infoEstado = obtenerInfoEstadoPedido(estado);

    const pedidoActualizado = await prisma.pedido.update({
      where: {
        id: pedidoId,
      },
      data: {
        estado,
        seguimientos: {
          create: {
            estado,
            titulo: infoEstado.titulo,
            detalle: detalle || infoEstado.detalle,
          },
        },
      },
      include: {
        items: true,
        direccion: true,
        seguimientos: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    res.json({
      ok: true,
      mensaje: "Estado del pedido actualizado correctamente",
      pedido: pedidoActualizado,
    });
  } catch (error) {
    console.error("Error al actualizar estado del pedido:", error);

    res.status(500).json({
      ok: false,
      mensaje: error.message || "Error al actualizar estado del pedido",
    });
  }
};