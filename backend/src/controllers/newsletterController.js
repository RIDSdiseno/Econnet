import prisma from "../config/prisma.js";

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function generarCodigoDescuento() {
  return "BIENVENIDA10";
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
            codigoDescuento:
              suscriptorExistente.codigoDescuento || generarCodigoDescuento(),
            descuentoPorcentaje: suscriptorExistente.descuentoPorcentaje || 10,
          },
        });

        return res.json({
          ok: true,
          mensaje: "Suscripción reactivada correctamente",
          codigoDescuento: suscriptorReactivado.codigoDescuento,
          descuentoPorcentaje: suscriptorReactivado.descuentoPorcentaje,
        });
      }

      return res.json({
        ok: true,
        mensaje: "Este correo ya está suscrito",
        codigoDescuento:
          suscriptorExistente.codigoDescuento || generarCodigoDescuento(),
        descuentoPorcentaje: suscriptorExistente.descuentoPorcentaje || 10,
      });
    }

    const nuevoSuscriptor = await prisma.newsletterSuscriptor.create({
      data: {
        email: emailNormalizado,
        activo: true,
        codigoDescuento: generarCodigoDescuento(),
        descuentoPorcentaje: 10,
        usado: false,
      },
    });

    return res.status(201).json({
      ok: true,
      mensaje: "Suscripción realizada correctamente",
      codigoDescuento: nuevoSuscriptor.codigoDescuento,
      descuentoPorcentaje: nuevoSuscriptor.descuentoPorcentaje,
    });
  } catch (error) {
    console.error("Error al suscribirse al newsletter:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error al registrar la suscripción",
    });
  }
};