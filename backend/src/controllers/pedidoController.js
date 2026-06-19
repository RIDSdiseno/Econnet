import prisma from "../config/prisma.js";
import { obtenerTarifaDespacho } from "../utils/despacho.js";
import {
  obtenerInfoEstadoPedido,
  estadoPedidoValido,
} from "../utils/estadosPedido.js";
import { generarDocumentoPedidoPDF } from "../services/documentoPdfService.js";


const METODOS_PAGO_VALIDOS = [
  "webpay",
  "oneclick",
  "mercadopago",
];

const METODOS_PAGO_ONLINE = [
  "webpay",
  "oneclick",
  "mercadopago",
];


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

const limpiarTexto = (valor) => {
  return typeof valor === "string" ? valor.trim() : "";
};

const emailValido = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const normalizarItemsInvitado = (items = []) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("El carrito está vacío");
  }

  const mapaItems = new Map();

  for (const item of items) {
    const productoId = Number(item.productoId || item.id);
    const cantidad = Number(item.cantidad);

    if (!Number.isInteger(productoId) || productoId <= 0) {
      throw new Error("Uno de los productos del carrito no es válido");
    }

    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      throw new Error("La cantidad de un producto no es válida");
    }

    mapaItems.set(
      productoId,
      (mapaItems.get(productoId) || 0) + cantidad,
    );
  }

  return Array.from(mapaItems.entries()).map(
    ([productoId, cantidad]) => ({
      productoId,
      cantidad,
    }),
  );
};

const construirItemsInvitado = (itemsNormalizados, productos) => {
  const productosPorId = new Map(
    productos.map((producto) => [producto.id, producto]),
  );

  return itemsNormalizados.map((item) => {
    const producto = productosPorId.get(item.productoId);

    if (!producto) {
      throw new Error("Uno de los productos ya no está disponible");
    }

    return {
      productoId: item.productoId,
      cantidad: item.cantidad,
      producto,
    };
  });
};

export const crearPedido = async (req, res) => {
  try {
    const {
      direccionId,
      tipoEntrega = "despacho",
      metodoPago = "webpay",
      documento = "boleta",

      nombreCliente,
      emailCliente,
      telefonoCliente,
      direccionTexto,
      region,
      comuna,

      items = [],

      rutFacturacion,
      razonSocialFacturacion,
      giroFacturacion,
      direccionFacturacion,
      comunaFacturacion,
      ciudadFacturacion,
    } = req.body;

    const usuarioAutenticado = req.usuario || null;
    const esInvitado = !usuarioAutenticado;

    if (!METODOS_PAGO_VALIDOS.includes(metodoPago)) {
      return res.status(400).json({
        ok: false,
        mensaje: "Método de pago inválido",
      });
    }

    if (esInvitado && metodoPago === "oneclick") {
      return res.status(400).json({
        ok: false,
        mensaje:
          "Oneclick solo está disponible para usuarios registrados",
      });
    }

    const requiereConfirmacionPago =
      METODOS_PAGO_ONLINE.includes(metodoPago);

    if (!["boleta", "factura"].includes(documento)) {
      return res.status(400).json({
        ok: false,
        mensaje: "Tipo de documento inválido",
      });
    }

    if (!["despacho", "retiro"].includes(tipoEntrega)) {
      return res.status(400).json({
        ok: false,
        mensaje: "Tipo de entrega inválido",
      });
    }

    if (
      !esInvitado &&
      tipoEntrega === "despacho" &&
      !direccionId
    ) {
      return res.status(400).json({
        ok: false,
        mensaje: "Debes seleccionar una dirección de despacho",
      });
    }

    if (esInvitado) {
      const nombreInvitado = limpiarTexto(nombreCliente);
      const emailInvitado = limpiarTexto(emailCliente).toLowerCase();

      if (!nombreInvitado) {
        return res.status(400).json({
          ok: false,
          mensaje: "Debes ingresar tu nombre",
        });
      }

      if (!emailInvitado || !emailValido(emailInvitado)) {
        return res.status(400).json({
          ok: false,
          mensaje: "Debes ingresar un correo válido",
        });
      }

      if (tipoEntrega === "despacho") {
        const direccionInvitado = limpiarTexto(direccionTexto);
        const comunaInvitado = limpiarTexto(comuna);

        if (!direccionInvitado || !comunaInvitado) {
          return res.status(400).json({
            ok: false,
            mensaje:
              "Debes ingresar dirección y comuna para el despacho",
          });
        }
      }
    }

    if (documento === "factura") {
      const datosFacturaCompletos =
        limpiarTexto(rutFacturacion) &&
        limpiarTexto(razonSocialFacturacion) &&
        limpiarTexto(giroFacturacion) &&
        limpiarTexto(direccionFacturacion) &&
        limpiarTexto(comunaFacturacion) &&
        limpiarTexto(ciudadFacturacion);

      if (!datosFacturaCompletos) {
        return res.status(400).json({
          ok: false,
          mensaje: "Debes completar todos los datos de facturación",
        });
      }
    }

    const pedido = await prisma.$transaction(async (tx) => {
      let usuario = null;
      let direccionSeleccionada = null;
      let itemsPedido = [];

      if (!esInvitado) {
        usuario = await tx.usuario.findUnique({
          where: {
            id: usuarioAutenticado.id,
          },
          select: {
            id: true,
            nombre: true,
            email: true,
            telefono: true,
            descuentoBienvenidaDisponible: true,
            descuentoBienvenidaUsado: true,
          },
        });

        if (!usuario) {
          throw new Error("Usuario no encontrado");
        }

        if (tipoEntrega === "despacho") {
          direccionSeleccionada = await tx.direccion.findFirst({
            where: {
              id: Number(direccionId),
              usuarioId: usuario.id,
            },
          });

          if (!direccionSeleccionada) {
            throw new Error("Dirección no encontrada");
          }
        }

        itemsPedido = await tx.carritoItem.findMany({
          where: {
            usuarioId: usuario.id,
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
      }

      if (esInvitado) {
        const itemsNormalizados = normalizarItemsInvitado(items);

        const productos = await tx.producto.findMany({
          where: {
            id: {
              in: itemsNormalizados.map((item) => item.productoId),
            },
            activo: true,
          },
          include: {
            marca: true,
            imagenes: {
              orderBy: {
                orden: "asc",
              },
            },
          },
        });

        itemsPedido = construirItemsInvitado(
          itemsNormalizados,
          productos,
        );

        if (tipoEntrega === "despacho") {
          direccionSeleccionada = {
            direccion: limpiarTexto(direccionTexto),
            comuna: limpiarTexto(comuna),
            region: limpiarTexto(region) || null,
          };
        }
      }

      if (itemsPedido.length === 0) {
        throw new Error("El carrito está vacío");
      }

      for (const item of itemsPedido) {
        if (!item.producto.activo) {
          throw new Error(
            `El producto ${item.producto.nombre} no está disponible`,
          );
        }

        if (item.cantidad > item.producto.stock) {
          throw new Error(
            `No hay stock suficiente para ${item.producto.nombre}`,
          );
        }
      }

      const subtotal = itemsPedido.reduce((total, item) => {
        return total + item.producto.precio * item.cantidad;
      }, 0);

      const aplicaDescuentoBienvenida =
        !esInvitado &&
        usuario.descuentoBienvenidaDisponible === true &&
        usuario.descuentoBienvenidaUsado === false;

      const descuento = aplicaDescuentoBienvenida
        ? Math.round(subtotal * 0.1)
        : 0;

      const tarifaDespacho = await obtenerTarifaDespacho(
        tx,
        tipoEntrega,
        direccionSeleccionada,
      );

      const despacho = tarifaDespacho.precio;
      const total = subtotal - descuento + despacho;

      const neto = Math.round(total / 1.19);
      const iva = total - neto;

      const minutosVencimiento = 30;

      const fechaVencimientoPago = new Date(
        Date.now() + minutosVencimiento * 60 * 1000,
      );

      const estadoInicial = obtenerInfoEstadoPedido("pendiente");

      const nuevoPedido = await tx.pedido.create({
        data: {
          usuarioId: esInvitado ? null : usuario.id,
          direccionId:
            !esInvitado && tipoEntrega === "despacho"
              ? Number(direccionId)
              : null,

          numero: generarNumeroPedido(),
          estado: "pendiente",
          estadoPago: "pendiente",

          fechaVencimientoPago,
          stockRestaurado: false,

          tipoEntrega,
          metodoPago,
          documento,

          rutFacturacion:
            documento === "factura"
              ? limpiarTexto(rutFacturacion)
              : null,

          razonSocialFacturacion:
            documento === "factura"
              ? limpiarTexto(razonSocialFacturacion)
              : null,

          giroFacturacion:
            documento === "factura"
              ? limpiarTexto(giroFacturacion)
              : null,

          direccionFacturacion:
            documento === "factura"
              ? limpiarTexto(direccionFacturacion)
              : null,

          comunaFacturacion:
            documento === "factura"
              ? limpiarTexto(comunaFacturacion)
              : null,

          ciudadFacturacion:
            documento === "factura"
              ? limpiarTexto(ciudadFacturacion)
              : null,

          nombreCliente: esInvitado
            ? limpiarTexto(nombreCliente)
            : usuario.nombre,

          emailCliente: esInvitado
            ? limpiarTexto(emailCliente).toLowerCase()
            : usuario.email,

          telefonoCliente: esInvitado
            ? limpiarTexto(telefonoCliente) || null
            : usuario.telefono,

          direccionTexto: direccionSeleccionada?.direccion || null,
          region: direccionSeleccionada?.region || null,
          comuna: direccionSeleccionada?.comuna || null,

          subtotal,
          descuento,
          despacho,
          neto,
          iva,
          total,

          items: {
            create: itemsPedido.map((item) => ({
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
          },
        },
      });

      for (const item of itemsPedido) {
        const stockActualizado = await tx.producto.updateMany({
          where: {
            id: item.productoId,
            stock: {
              gte: item.cantidad,
            },
          },
          data: {
            stock: {
              decrement: item.cantidad,
            },
          },
        });

        if (stockActualizado.count !== 1) {
          throw new Error(
            `No hay stock suficiente para ${item.producto.nombre}`,
          );
        }
      }

      if (
        !esInvitado &&
        descuento > 0 &&
        !requiereConfirmacionPago
      ) {
        await tx.usuario.update({
          where: {
            id: usuario.id,
          },
          data: {
            descuentoBienvenidaDisponible: false,
            descuentoBienvenidaUsado: true,
          },
        });

        await tx.newsletterSuscriptor.updateMany({
          where: {
            email: usuario.email,
          },
          data: {
            usado: true,
          },
        });
      }

      /*
       * Los métodos de pago online mantienen el carrito del usuario
       * hasta que el proveedor confirme el pago.
       */
      if (
        !esInvitado &&
        !requiereConfirmacionPago
      ) {
        await tx.carritoItem.deleteMany({
          where: {
            usuarioId: usuario.id,
          },
        });
      }

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

    const pedidoActual = await prisma.pedido.findUnique({
      where: {
        id: pedidoId,
      },
      include: {
        items: true,
      },
    });

    if (!pedidoActual) {
      return res.status(404).json({
        ok: false,
        mensaje: "Pedido no encontrado",
      });
    }

    /*
     * No permitimos reactivar un pedido cancelado cuyo stock
     * ya fue devuelto. Reactivarlo requeriría volver a comprobar
     * y descontar el inventario.
     */
    if (
      pedidoActual.stockRestaurado === true &&
      estado !== "cancelado"
    ) {
      return res.status(400).json({
        ok: false,
        mensaje:
          "No puedes reactivar este pedido porque su stock ya fue restaurado",
      });
    }

    const infoEstado = obtenerInfoEstadoPedido(estado);

    let pedidoActualizado;

    if (estado === "cancelado") {
      pedidoActualizado = await prisma.$transaction(async (tx) => {
        /*
         * Solo el primer intento de cancelación puede reservar
         * la restauración del inventario.
         */
        const reservaRestauracion = await tx.pedido.updateMany({
          where: {
            id: pedidoId,
            stockRestaurado: false,
          },
          data: {
            estado: "cancelado",
            stockRestaurado: true,
          },
        });

        if (reservaRestauracion.count === 1) {
          for (const item of pedidoActual.items) {
            await tx.producto.update({
              where: {
                id: item.productoId,
              },
              data: {
                stock: {
                  increment: item.cantidad,
                },
              },
            });
          }

          /*
           * Un pedido pendiente queda con pago cancelado.
           * Si ya estaba pagado, se conserva como aprobado porque
           * cancelar el pedido no reembolsa el dinero automáticamente.
           */
          await tx.pedido.updateMany({
            where: {
              id: pedidoId,
              estadoPago: "pendiente",
            },
            data: {
              estadoPago: "cancelado",
            },
          });

          await tx.pedidoSeguimiento.create({
            data: {
              pedidoId,
              estado: "cancelado",
              titulo: infoEstado.titulo,
              detalle:
                detalle ||
                "El pedido fue cancelado por un administrador y el stock fue restaurado.",
            },
          });
        }

        return tx.pedido.findUnique({
          where: {
            id: pedidoId,
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
      });
    } else {
      pedidoActualizado = await prisma.pedido.update({
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
    }

    return res.json({
      ok: true,
      mensaje:
        estado === "cancelado"
          ? "Pedido cancelado y stock restaurado correctamente"
          : "Estado del pedido actualizado correctamente",
      pedido: pedidoActualizado,
    });
  } catch (error) {
    console.error("Error al actualizar estado del pedido:", error);

    return res.status(500).json({
      ok: false,
      mensaje:
        error.message || "Error al actualizar estado del pedido",
    });
  }
};


export const descargarDocumentoPedidoInvitado = async (req, res) => {
  try {
    const { id } = req.params;
    const { orden } = req.query;

    const pedidoId = Number(id);

    if (!pedidoId || !orden) {
      return res.status(400).json({
        ok: false,
        mensaje: "Datos inválidos para descargar el documento",
      });
    }

    const pedido = await prisma.pedido.findFirst({
      where: {
        id: pedidoId,
        usuarioId: null,
        ordenCompraPago: String(orden),
        estadoPago: "aprobado",
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
        mensaje: "Documento no encontrado",
      });
    }

    const buffer = await generarDocumentoPedidoPDF(pedido);

    const tipoDocumento =
      pedido.documento === "factura" ? "Factura-Proforma" : "Comprobante";

    const numeroPedido = String(pedido.numero || pedido.id).replace(
      /[^a-zA-Z0-9-_]/g,
      "_",
    );

    const nombreArchivo = `${tipoDocumento}-${numeroPedido}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${nombreArchivo}"`,
    );

    return res.send(buffer);
  } catch (error) {
    console.error("Error al descargar documento invitado:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "No se pudo descargar el documento",
    });
  }
};



export const obtenerSeguimientoPedidoInvitado = async (req, res) => {
  try {
    const { id } = req.params;
    const { orden } = req.query;

    const pedidoId = Number(id);

    if (!pedidoId || !orden) {
      return res.status(400).json({
        ok: false,
        mensaje: "Datos inválidos para consultar el seguimiento",
      });
    }

    const pedido = await prisma.pedido.findFirst({
      where: {
        id: pedidoId,
        usuarioId: null,
        ordenCompraPago: String(orden),
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

    return res.json({
      ok: true,
      pedido,
    });
  } catch (error) {
    console.error("Error al obtener seguimiento invitado:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error al obtener seguimiento del pedido",
    });
  }
};

export const buscarPedidoInvitado = async (req, res) => {
  try {
    const { numero, email } = req.query;

    const numeroPedido = String(numero || "").trim();
    const emailCliente = String(email || "").trim().toLowerCase();

    if (!numeroPedido || !emailCliente) {
      return res.status(400).json({
        ok: false,
        mensaje: "Debes ingresar número de pedido y correo",
      });
    }

    const pedido = await prisma.pedido.findFirst({
      where: {
        usuarioId: null,
        numero: {
          equals: numeroPedido,
          mode: "insensitive",
        },
        emailCliente: {
          equals: emailCliente,
          mode: "insensitive",
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

    if (!pedido) {
      return res.status(404).json({
        ok: false,
        mensaje: "No encontramos un pedido con esos datos",
      });
    }

    return res.json({
      ok: true,
      pedido,
    });
  } catch (error) {
    console.error("Error al buscar pedido invitado:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error al buscar el pedido",
    });
  }
};