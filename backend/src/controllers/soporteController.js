import prisma from "../config/prisma.js";

const CATEGORIAS_VALIDAS = [
  "despacho",
  "pagos",
  "documentos",
  "garantias",
  "devoluciones",
  "reembolsos",
  "compras_empresas",
  "soporte_tecnico",
  "otro",
];



const CATEGORIAS_CON_PEDIDO = new Set([
  "despacho",
  "pagos",
  "garantias",
  "devoluciones",
  "reembolsos",
]);


function generarCodigoTicket() {
  const fecha = new Date();
  const year = fecha.getFullYear();
  const timestamp = Date.now();

  return `SOP-${year}-${timestamp}`;
}

function limpiarTexto(valor) {
  return typeof valor === "string" ? valor.trim() : "";
}

function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const crearTicketSoporte = async (req, res) => {
  try {
    const {
      nombre,
      email,
      telefono,
      categoria,
      asunto,
      mensaje,
      aceptaPrivacidad,
      pedidoId,
    } = req.body;

    const nombreLimpio = limpiarTexto(nombre);
    const emailLimpio = limpiarTexto(email).toLowerCase();
    const telefonoLimpio = limpiarTexto(telefono);
    const categoriaLimpia = limpiarTexto(categoria);
    const asuntoLimpio = limpiarTexto(asunto);
    const mensajeLimpio = limpiarTexto(mensaje);

    if (!nombreLimpio) {
      return res.status(400).json({
        ok: false,
        mensaje: "El nombre es obligatorio",
      });
    }

    if (!emailLimpio || !emailValido(emailLimpio)) {
      return res.status(400).json({
        ok: false,
        mensaje: "Debes ingresar un correo electrónico válido",
      });
    }

    if (!CATEGORIAS_VALIDAS.includes(categoriaLimpia)) {
      return res.status(400).json({
        ok: false,
        mensaje: "La categoría seleccionada no es válida",
      });
    }

    if (!asuntoLimpio) {
      return res.status(400).json({
        ok: false,
        mensaje: "El asunto es obligatorio",
      });
    }

    if (!mensajeLimpio) {
      return res.status(400).json({
        ok: false,
        mensaje: "El mensaje es obligatorio",
      });
    }

    if (nombreLimpio.length > 120) {
      return res.status(400).json({
        ok: false,
        mensaje: "El nombre no puede superar los 120 caracteres",
      });
    }

    if (emailLimpio.length > 180) {
      return res.status(400).json({
        ok: false,
        mensaje: "El correo es demasiado largo",
      });
    }

    if (telefonoLimpio.length > 30) {
      return res.status(400).json({
        ok: false,
        mensaje: "El teléfono es demasiado largo",
      });
    }

    if (asuntoLimpio.length > 180) {
      return res.status(400).json({
        ok: false,
        mensaje: "El asunto no puede superar los 180 caracteres",
      });
    }

    if (mensajeLimpio.length > 5000) {
      return res.status(400).json({
        ok: false,
        mensaje: "El mensaje no puede superar los 5000 caracteres",
      });
    }

    if (aceptaPrivacidad !== true) {
      return res.status(400).json({
        ok: false,
        mensaje: "Debes aceptar la política de privacidad",
      });
    }

    const usuarioId = req.usuario?.id ?? null;
    let pedidoIdValidado = null;

    const pedidoFueEnviado =
      pedidoId !== undefined &&
      pedidoId !== null &&
      pedidoId !== "";

    if (pedidoFueEnviado) {
      if (!usuarioId) {
        return res.status(401).json({
          ok: false,
          mensaje: "Debes iniciar sesión para asociar un pedido",
        });
      }

      if (!CATEGORIAS_CON_PEDIDO.has(categoriaLimpia)) {
        return res.status(400).json({
          ok: false,
          mensaje:
            "La categoría seleccionada no permite asociar un pedido",
        });
      }

      const pedidoIdNumero = Number(pedidoId);

      if (
        !Number.isInteger(pedidoIdNumero) ||
        pedidoIdNumero <= 0
      ) {
        return res.status(400).json({
          ok: false,
          mensaje: "El pedido seleccionado no es válido",
        });
      }

      const pedidoUsuario = await prisma.pedido.findFirst({
        where: {
          id: pedidoIdNumero,
          usuarioId,
        },
        select: {
          id: true,
        },
      });

      if (!pedidoUsuario) {
        return res.status(404).json({
          ok: false,
          mensaje:
            "El pedido seleccionado no existe o no pertenece a tu cuenta",
        });
      }

      pedidoIdValidado = pedidoUsuario.id;
    }

    const ticket = await prisma.ticketSoporte.create({
      data: {
        codigo: generarCodigoTicket(),
        usuarioId,
        pedidoId: pedidoIdValidado,
        nombre: nombreLimpio,
        email: emailLimpio,
        telefono: telefonoLimpio || null,
        categoria: categoriaLimpia,
        asunto: asuntoLimpio,
        mensaje: mensajeLimpio,
        estado: "nuevo",
        prioridad: "normal",
        aceptaPrivacidad: true,
      },
    });

    return res.status(201).json({
      ok: true,
      mensaje: "Tu solicitud fue enviada correctamente",
      ticket: {
        id: ticket.id,
        codigo: ticket.codigo,
        estado: ticket.estado,
        usuarioAsociado: Boolean(ticket.usuarioId),
        pedidoAsociado: Boolean(ticket.pedidoId),
        pedidoId: ticket.pedidoId,
        createdAt: ticket.createdAt,
      },
    });
  } catch (error) {
    console.error("Error al crear ticket de soporte:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "No se pudo enviar la solicitud de soporte",
    });
  }
};


export const obtenerMisSolicitudes = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const paginaSolicitada = Number.parseInt(req.query.pagina, 10);
    const limiteSolicitado = Number.parseInt(req.query.limite, 10);

    const pagina =
      Number.isInteger(paginaSolicitada) && paginaSolicitada > 0
        ? paginaSolicitada
        : 1;

    const limite =
      Number.isInteger(limiteSolicitado) && limiteSolicitado > 0
        ? Math.min(limiteSolicitado, 50)
        : 10;

    const skip = (pagina - 1) * limite;

    const where = {
      usuarioId,
    };

    const [solicitudes, total] = await prisma.$transaction([
      prisma.ticketSoporte.findMany({
        where,
        select: {
          id: true,
          codigo: true,
          categoria: true,
          asunto: true,
          estado: true,
          prioridad: true,
          createdAt: true,
          updatedAt: true,
          cerradoAt: true,
          _count: {
            select: {
              respuestas: true,
            },
          },
        },
        orderBy: [
          {
            updatedAt: "desc",
          },
          {
            createdAt: "desc",
          },
        ],
        skip,
        take: limite,
      }),

      prisma.ticketSoporte.count({
        where,
      }),
    ]);

    const totalPaginas = Math.max(Math.ceil(total / limite), 1);

    return res.json({
      ok: true,
      solicitudes: solicitudes.map((solicitud) => ({
        id: solicitud.id,
        codigo: solicitud.codigo,
        categoria: solicitud.categoria,
        asunto: solicitud.asunto,
        estado: solicitud.estado,
        prioridad: solicitud.prioridad,
        cantidadRespuestas: solicitud._count.respuestas,
        createdAt: solicitud.createdAt,
        updatedAt: solicitud.updatedAt,
        cerradoAt: solicitud.cerradoAt,
      })),
      paginacion: {
        pagina,
        limite,
        total,
        totalPaginas,
        tieneAnterior: pagina > 1,
        tieneSiguiente: pagina < totalPaginas,
      },
    });
  } catch (error) {
    console.error("Error al obtener solicitudes del usuario:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "No se pudieron obtener tus solicitudes",
    });
  }
};

export const obtenerMiSolicitudPorId = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const ticketId = Number.parseInt(req.params.id, 10);

    if (!Number.isInteger(ticketId) || ticketId <= 0) {
      return res.status(400).json({
        ok: false,
        mensaje: "El identificador de la solicitud no es válido",
      });
    }

    const solicitud = await prisma.ticketSoporte.findFirst({
      where: {
        id: ticketId,
        usuarioId,
      },
      select: {
        id: true,
        codigo: true,
        nombre: true,
        email: true,
        telefono: true,
        categoria: true,
        asunto: true,
        mensaje: true,
        estado: true,
        prioridad: true,
        createdAt: true,
        updatedAt: true,
        cerradoAt: true,
        respuestas: {
          orderBy: {
            createdAt: "asc",
          },
          select: {
            id: true,
            tipoAutor: true,
            mensaje: true,
            createdAt: true,
            autor: {
              select: {
                id: true,
                nombre: true,
              },
            },
          },
        },
        pedido: {
          select: {
            id: true,
            numero: true,
            estado: true,
            estadoPago: true,
            total: true,
            createdAt: true,
          },
        },
      },
    });

    /*
     * Se utiliza el mismo mensaje cuando no existe o pertenece
     * a otra persona para no revelar información privada.
     */
    if (!solicitud) {
      return res.status(404).json({
        ok: false,
        mensaje: "Solicitud no encontrada",
      });
    }

    return res.json({
      ok: true,
      solicitud,
    });
  } catch (error) {
    console.error("Error al obtener detalle de solicitud:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "No se pudo obtener la solicitud",
    });
  }
};

export const responderMiSolicitud = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const ticketId = Number.parseInt(req.params.id, 10);
    const mensajeLimpio = limpiarTexto(req.body.mensaje);

    if (!Number.isInteger(ticketId) || ticketId <= 0) {
      return res.status(400).json({
        ok: false,
        mensaje: "El identificador de la solicitud no es válido",
      });
    }

    if (!mensajeLimpio) {
      return res.status(400).json({
        ok: false,
        mensaje: "Debes escribir una respuesta",
      });
    }

    if (mensajeLimpio.length > 5000) {
      return res.status(400).json({
        ok: false,
        mensaje: "La respuesta no puede superar los 5000 caracteres",
      });
    }

    const solicitud = await prisma.ticketSoporte.findFirst({
      where: {
        id: ticketId,
        usuarioId,
      },
      select: {
        id: true,
        estado: true,
      },
    });

    if (!solicitud) {
      return res.status(404).json({
        ok: false,
        mensaje: "Solicitud no encontrada",
      });
    }

    if (solicitud.estado === "cerrado") {
      return res.status(400).json({
        ok: false,
        mensaje: "Esta solicitud está cerrada y no admite nuevas respuestas",
      });
    }

    const resultado = await prisma.$transaction(async (tx) => {
      const respuesta = await tx.respuestaTicketSoporte.create({
        data: {
          ticketId: solicitud.id,
          autorId: usuarioId,
          tipoAutor: "cliente",
          mensaje: mensajeLimpio,
        },
        select: {
          id: true,
          tipoAutor: true,
          mensaje: true,
          createdAt: true,
          autor: {
            select: {
              id: true,
              nombre: true,
            },
          },
        },
      });

      /*
       * Cuando el cliente responde, el ticket vuelve a revisión
       * para indicarle al administrador que hay una respuesta pendiente.
       */
      const ticketActualizado = await tx.ticketSoporte.update({
        where: {
          id: solicitud.id,
        },
        data: {
          estado: "en_revision",
          cerradoAt: null,
        },
        select: {
          id: true,
          estado: true,
          updatedAt: true,
        },
      });

      return {
        respuesta,
        ticket: ticketActualizado,
      };
    });

    return res.status(201).json({
      ok: true,
      mensaje: "Tu respuesta fue enviada correctamente",
      respuesta: resultado.respuesta,
      estado: resultado.ticket.estado,
      updatedAt: resultado.ticket.updatedAt,
    });
  } catch (error) {
    console.error("Error al responder solicitud:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "No se pudo enviar la respuesta",
    });
  }
};