import logger, { serializeError } from "../config/logger.js";
import prisma from "../config/prisma.js";

const ESTADOS_VALIDOS = [
  "nuevo",
  "en_revision",
  "respondido",
  "cerrado",
];

function obtenerIdValido(valor) {
  const id = Number(valor);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

export const obtenerTicketsSoporteAdmin = async (req, res) => {
  try {
    const {
      estado = "",
      categoria = "",
      busqueda = "",
      pagina = "1",
      limite = "10",
    } = req.query;

    const paginaActual = Math.max(
      Number.parseInt(pagina, 10) || 1,
      1,
    );

    const limiteActual = Math.min(
      Math.max(Number.parseInt(limite, 10) || 10, 1),
      100,
    );

    const where = {};

    if (estado) {
      where.estado = estado;
    }

    if (categoria) {
      where.categoria = categoria;
    }

    const textoBusqueda = String(busqueda).trim();

    if (textoBusqueda) {
      where.OR = [
        {
          codigo: {
            contains: textoBusqueda,
            mode: "insensitive",
          },
        },
        {
          nombre: {
            contains: textoBusqueda,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: textoBusqueda,
            mode: "insensitive",
          },
        },
        {
          asunto: {
            contains: textoBusqueda,
            mode: "insensitive",
          },
        },
      ];
    }

    const [tickets, total] = await prisma.$transaction([
      prisma.ticketSoporte.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip: (paginaActual - 1) * limiteActual,
        take: limiteActual,
        select: {
          id: true,
          codigo: true,
          nombre: true,
          email: true,
          telefono: true,
          categoria: true,
          asunto: true,
          estado: true,
          prioridad: true,
          pedidoId: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              respuestas: true,
            },
          },
        },
      }),

      prisma.ticketSoporte.count({
        where,
      }),
    ]);

    return res.json({
      ok: true,
      tickets,
      paginacion: {
        pagina: paginaActual,
        limite: limiteActual,
        total,
        totalPaginas: Math.max(
          Math.ceil(total / limiteActual),
          1,
        ),
      },
    });
  } catch (error) {
    logger.error(
      "Error al obtener tickets de soporte:",
      error,
    );

    return res.status(500).json({
      ok: false,
      mensaje: "No se pudieron obtener las solicitudes de soporte",
    });
  }
};

export const obtenerTicketSoporteAdminPorId = async (
  req,
  res,
) => {
  try {
    const ticketId = obtenerIdValido(req.params.id);

    if (!ticketId) {
      return res.status(400).json({
        ok: false,
        mensaje: "El identificador del ticket no es válido",
      });
    }

    const ticket = await prisma.ticketSoporte.findUnique({
      where: {
        id: ticketId,
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            telefono: true,
          },
        },
        pedido: {
          select: {
            id: true,
            numero: true,
            estado: true,
            estadoPago: true,
            metodoPago: true,
            total: true,
          },
        },
        respuestas: {
          orderBy: {
            createdAt: "asc",
          },
          include: {
            autor: {
              select: {
                id: true,
                nombre: true,
                email: true,
                rol: true,
              },
            },
          },
        },
      },
    });

    if (!ticket) {
      return res.status(404).json({
        ok: false,
        mensaje: "La solicitud de soporte no existe",
      });
    }

    return res.json({
      ok: true,
      ticket,
    });
  } catch (error) {
    logger.error(
      "Error al obtener detalle de soporte:",
      error,
    );

    return res.status(500).json({
      ok: false,
      mensaje: "No se pudo obtener la solicitud de soporte",
    });
  }
};

export const responderTicketSoporteAdmin = async (
  req,
  res,
) => {
  try {
    const ticketId = obtenerIdValido(req.params.id);
    const mensaje = String(req.body.mensaje || "").trim();

    if (!ticketId) {
      return res.status(400).json({
        ok: false,
        mensaje: "El identificador del ticket no es válido",
      });
    }

    if (!mensaje) {
      return res.status(400).json({
        ok: false,
        mensaje: "Debes escribir una respuesta",
      });
    }

    if (mensaje.length > 5000) {
      return res.status(400).json({
        ok: false,
        mensaje: "La respuesta no puede superar los 5000 caracteres",
      });
    }

    const ticketExistente =
      await prisma.ticketSoporte.findUnique({
        where: {
          id: ticketId,
        },
        select: {
          id: true,
          estado: true,
        },
      });

    if (!ticketExistente) {
      return res.status(404).json({
        ok: false,
        mensaje: "La solicitud de soporte no existe",
      });
    }

    if (ticketExistente.estado === "cerrado") {
      return res.status(400).json({
        ok: false,
        mensaje:
          "No puedes responder una solicitud que está cerrada",
      });
    }

    const resultado = await prisma.$transaction(async (tx) => {
      const respuesta = await tx.respuestaTicketSoporte.create({
        data: {
          ticketId,
          autorId: req.usuario.id,
          tipoAutor: "admin",
          mensaje,
        },
        include: {
          autor: {
            select: {
              id: true,
              nombre: true,
              email: true,
              rol: true,
            },
          },
        },
      });

      const ticket = await tx.ticketSoporte.update({
        where: {
          id: ticketId,
        },
        data: {
          estado: "respondido",
          cerradoAt: null,
        },
      });

      return {
        respuesta,
        ticket,
      };
    });

    return res.status(201).json({
      ok: true,
      mensaje: "Respuesta registrada correctamente",
      respuesta: resultado.respuesta,
      estado: resultado.ticket.estado,
    });
  } catch (error) {
    logger.error(
      "Error al responder ticket de soporte:",
      error,
    );

    return res.status(500).json({
      ok: false,
      mensaje: "No se pudo registrar la respuesta",
    });
  }
};

export const actualizarEstadoTicketSoporteAdmin = async (
  req,
  res,
) => {
  try {
    const ticketId = obtenerIdValido(req.params.id);
    const estado = String(req.body.estado || "").trim();

    if (!ticketId) {
      return res.status(400).json({
        ok: false,
        mensaje: "El identificador del ticket no es válido",
      });
    }

    if (!ESTADOS_VALIDOS.includes(estado)) {
      return res.status(400).json({
        ok: false,
        mensaje: "El estado seleccionado no es válido",
      });
    }

    const ticketExistente =
      await prisma.ticketSoporte.findUnique({
        where: {
          id: ticketId,
        },
        select: {
          id: true,
        },
      });

    if (!ticketExistente) {
      return res.status(404).json({
        ok: false,
        mensaje: "La solicitud de soporte no existe",
      });
    }

    const ticket = await prisma.ticketSoporte.update({
      where: {
        id: ticketId,
      },
      data: {
        estado,
        cerradoAt:
          estado === "cerrado" ? new Date() : null,
      },
      select: {
        id: true,
        codigo: true,
        estado: true,
        cerradoAt: true,
        updatedAt: true,
      },
    });

    return res.json({
      ok: true,
      mensaje: "Estado actualizado correctamente",
      ticket,
    });
  } catch (error) {
    logger.error(
      "Error al actualizar estado del ticket:",
      error,
    );

    return res.status(500).json({
      ok: false,
      mensaje: "No se pudo actualizar el estado",
    });
  }
};