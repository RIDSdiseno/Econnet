import { randomBytes } from "node:crypto";
import logger, { serializeError } from "../config/logger.js";
import prisma from "../config/prisma.js";

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function generarCodigoDescuento() {
  return "BIENVENIDA3";
}

function generarUnsubscribeToken() {
  return randomBytes(32).toString("hex");
}

function crearDatosTokenDesuscripcion() {
  return {
    unsubscribeToken: generarUnsubscribeToken(),
    unsubscribeTokenCreatedAt: new Date(),
  };
}

export const suscribirseNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        ok: false,
        mensaje: "El correo es obligatorio",
      });
    }

    const emailNormalizado = email.trim().toLowerCase();

    if (!validarEmail(emailNormalizado)) {
      return res.status(400).json({
        ok: false,
        mensaje: "Ingresa un correo válido",
      });
    }

    const suscriptorExistente = await prisma.newsletterSuscriptor.findUnique({
      where: {
        email: emailNormalizado,
      },
    });

    if (suscriptorExistente) {
      if (!suscriptorExistente.activo) {
        const suscriptorReactivado = await prisma.newsletterSuscriptor.update({
          where: {
            email: emailNormalizado,
          },
          data: {
            activo: true,
            fechaDesuscripcion: null,
            ...crearDatosTokenDesuscripcion(),
            codigoDescuento:
              suscriptorExistente.codigoDescuento || generarCodigoDescuento(),
            descuentoPorcentaje: suscriptorExistente.descuentoPorcentaje || 3,
          },
        });

        return res.json({
          ok: true,
          mensaje: "Suscripción reactivada correctamente",
          codigoDescuento: suscriptorReactivado.codigoDescuento,
          descuentoPorcentaje: suscriptorReactivado.descuentoPorcentaje,
        });
      }

      if (!suscriptorExistente.unsubscribeToken) {
        await prisma.newsletterSuscriptor.update({
          where: {
            email: emailNormalizado,
          },
          data: crearDatosTokenDesuscripcion(),
        });
      }

      return res.json({
        ok: true,
        mensaje: "Este correo ya está suscrito",
        codigoDescuento:
          suscriptorExistente.codigoDescuento || generarCodigoDescuento(),
        descuentoPorcentaje: suscriptorExistente.descuentoPorcentaje || 3,
      });
    }

    const nuevoSuscriptor = await prisma.newsletterSuscriptor.create({
      data: {
        email: emailNormalizado,
        activo: true,
        codigoDescuento: generarCodigoDescuento(),
        descuentoPorcentaje: 3,
        usado: false,
        ...crearDatosTokenDesuscripcion(),
      },
    });

    return res.status(201).json({
      ok: true,
      mensaje: "Suscripción realizada correctamente",
      codigoDescuento: nuevoSuscriptor.codigoDescuento,
      descuentoPorcentaje: nuevoSuscriptor.descuentoPorcentaje,
    });
  } catch (error) {
    logger.error("Error al suscribirse al newsletter:", serializeError(error));

    if (error.code === "P2002") {
      return res.status(409).json({
        ok: false,
        mensaje: "No se pudo completar la suscripción. Intenta nuevamente.",
      });
    }

    return res.status(500).json({
      ok: false,
      mensaje: "Error al registrar la suscripción",
    });
  }
};

export const desuscribirNewsletter = async (req, res) => {
  try {
    const { token } = req.query;

    const suscriptor = await prisma.newsletterSuscriptor.findUnique({
      where: {
        unsubscribeToken: token,
      },
    });

    if (!suscriptor) {
      return res.status(400).json({
        ok: false,
        mensaje: "El enlace de desuscripción no es válido",
      });
    }

    if (!suscriptor.activo) {
      return res.json({
        ok: true,
        mensaje: "Esta dirección ya estaba desuscrita",
      });
    }

    await prisma.newsletterSuscriptor.update({
      where: {
        id: suscriptor.id,
      },
      data: {
        activo: false,
        fechaDesuscripcion: new Date(),
      },
    });

    return res.json({
      ok: true,
      mensaje: "Te has desuscrito correctamente del newsletter",
    });
  } catch (error) {
    logger.error("Error al desuscribir newsletter:", serializeError(error));

    return res.status(500).json({
      ok: false,
      mensaje: "No se pudo procesar la desuscripción",
    });
  }
};
