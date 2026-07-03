import logger, { serializeError } from "../config/logger.js";
import nodemailer from "nodemailer";
import prisma from "../config/prisma.js";
import { generarDocumentoPedidoPDF } from "./documentoPdfService.js";

function obtenerConfiguracionSMTP() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure =
    String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error(
      "Faltan las variables SMTP_HOST, SMTP_USER o SMTP_PASS",
    );
  }

  return {
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  };
}

function crearTransportador() {
  return nodemailer.createTransport(obtenerConfiguracionSMTP());
}

function formatearPrecio(valor) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(valor || 0);
}

function escaparHtml(valor = "") {
  return String(valor)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function limpiarNombreArchivo(valor = "") {
  return String(valor).replace(/[^a-zA-Z0-9-_]/g, "_");
}

function obtenerNombreDocumento(pedido) {
  const numero = limpiarNombreArchivo(pedido.numero || pedido.id);

  return `Comprobante-de-compra-${numero}.pdf`;
}

function obtenerTituloDocumento() {
  return "Comprobante de compra";
}
function construirProductosHtml(items = []) {
  return items
    .map(
      (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            ${escaparHtml(item.nombreProducto)}
          </td>

          <td
            style="
              padding: 12px;
              border-bottom: 1px solid #e5e7eb;
              text-align: center;
            "
          >
            ${item.cantidad}
          </td>

          <td
            style="
              padding: 12px;
              border-bottom: 1px solid #e5e7eb;
              text-align: right;
            "
          >
            ${formatearPrecio(item.subtotal)}
          </td>
        </tr>
      `,
    )
    .join("");
}

function construirCorreoHtml(pedido) {
  const tituloDocumento = obtenerTituloDocumento(pedido);

  return `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />

        <title>Pedido ${escaparHtml(pedido.numero)}</title>
      </head>

      <body
        style="
          margin: 0;
          padding: 0;
          background-color: #f3f4f6;
          font-family: Arial, Helvetica, sans-serif;
          color: #111827;
        "
      >
        <div style="padding: 30px 15px;">
          <div
            style="
              max-width: 680px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 18px;
              overflow: hidden;
              border: 1px solid #e5e7eb;
            "
          >
            <div
              style="
                background-color: #030712;
                color: #ffffff;
                padding: 28px 32px;
              "
            >
              <h1 style="margin: 0; font-size: 28px;">
                ECONNET
              </h1>

              <p
                style="
                  margin: 8px 0 0;
                  color: #d1d5db;
                  font-size: 14px;
                "
              >
                Domina la tecnología
              </p>
            </div>

            <div style="padding: 32px;">
              <h2
                style="
                  margin: 0 0 12px;
                  font-size: 24px;
                  color: #111827;
                "
              >
                Pago aprobado correctamente
              </h2>

              <p
                style="
                  margin: 0 0 24px;
                  color: #4b5563;
                  line-height: 1.6;
                "
              >
                Hola ${escaparHtml(pedido.nombreCliente)}, recibimos
                correctamente el pago de tu pedido.
              </p>

              <div
                style="
                  background-color: #f9fafb;
                  border: 1px solid #e5e7eb;
                  border-radius: 14px;
                  padding: 20px;
                  margin-bottom: 24px;
                "
              >
                <p style="margin: 0 0 10px;">
                  <strong>Número de pedido:</strong>
                  ${escaparHtml(pedido.numero)}
                </p>

                <p style="margin: 0 0 10px;">
                  <strong>Documento adjunto:</strong>
                  ${tituloDocumento}
                </p>

                <p style="margin: 0 0 10px;">
                  <strong>Método de pago:</strong>
                  ${escaparHtml(pedido.metodoPago)}
                </p>

                <p style="margin: 0;">
                  <strong>Total pagado:</strong>
                  ${formatearPrecio(pedido.total)}
                </p>
              </div>

              <h3 style="margin: 0 0 14px;">
                Productos
              </h3>

              <table
                style="
                  width: 100%;
                  border-collapse: collapse;
                  margin-bottom: 24px;
                "
              >
                <thead>
                  <tr style="background-color: #f3f4f6;">
                    <th
                      style="
                        padding: 12px;
                        text-align: left;
                        font-size: 13px;
                      "
                    >
                      Producto
                    </th>

                    <th
                      style="
                        padding: 12px;
                        text-align: center;
                        font-size: 13px;
                      "
                    >
                      Cant.
                    </th>

                    <th
                      style="
                        padding: 12px;
                        text-align: right;
                        font-size: 13px;
                      "
                    >
                      Subtotal
                    </th>
                  </tr>
                </thead>

                <tbody>
                  ${construirProductosHtml(pedido.items)}
                </tbody>
              </table>

              <div
                style="
                  border-top: 1px solid #e5e7eb;
                  padding-top: 20px;
                "
              >
                <p
                  style="
                    margin: 0 0 8px;
                    text-align: right;
                    color: #4b5563;
                  "
                >
                  Neto: ${formatearPrecio(pedido.neto)}
                </p>

                <p
                  style="
                    margin: 0 0 8px;
                    text-align: right;
                    color: #4b5563;
                  "
                >
                  IVA incluido 19%: ${formatearPrecio(pedido.iva)}
                </p>

                <p
                  style="
                    margin: 0;
                    text-align: right;
                    font-size: 20px;
                    font-weight: bold;
                  "
                >
                  Total: ${formatearPrecio(pedido.total)}
                </p>
              </div>

              <div
                style="
                  margin-top: 28px;
                  padding: 16px;
                  background-color: #fff7ed;
                  border: 1px solid #fed7aa;
                  border-radius: 12px;
                  color: #9a3412;
                  font-size: 13px;
                  line-height: 1.5;
                "
              >
                El documento adjunto es un comprobante interno de compra
                y no corresponde a una boleta o factura electrónica
                emitida ante el SII.
              </div>
            </div>

            <div
              style="
                padding: 20px 32px;
                background-color: #f9fafb;
                color: #6b7280;
                font-size: 12px;
                text-align: center;
              "
            >
              Este correo fue enviado automáticamente por Econnet.
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

export async function enviarDocumentoPedidoPorCorreo(pedidoId) {
  const id = Number(pedidoId);

  if (!id) {
    throw new Error("ID de pedido inválido para enviar correo");
  }

  /*
   * Reserva el envío.
   * Evita enviar dos veces el documento si el callback de pago
   * vuelve a ejecutarse.
   */
  const reserva = await prisma.pedido.updateMany({
    where: {
      id,
      estadoPago: "aprobado",
      documentoEmailEstado: {
        in: ["pendiente", "error"],
      },
    },
    data: {
      documentoEmailEstado: "procesando",
      errorDocumentoEmail: null,
    },
  });

  if (reserva.count === 0) {
    return {
      ok: true,
      omitido: true,
      mensaje:
        "El correo ya fue enviado, está procesándose o el pago no está aprobado",
    };
  }

  try {
    const pedido = await prisma.pedido.findUnique({
      where: {
        id,
      },
      include: {
        items: true,
        direccion: true,
      },
    });

    if (!pedido) {
      throw new Error("Pedido no encontrado");
    }

    if (!pedido.emailCliente) {
      throw new Error("El pedido no tiene correo de cliente");
    }

    const pdfBuffer = await generarDocumentoPedidoPDF(pedido);
    const nombreArchivo = obtenerNombreDocumento(pedido);
    const transportador = crearTransportador();

    const info = await transportador.sendMail({
      from: {
        name: process.env.EMAIL_FROM_NAME || "Econnet",
        address: process.env.EMAIL_FROM || process.env.SMTP_USER,
      },

      to: pedido.emailCliente,

      subject: `Pago aprobado - Pedido ${pedido.numero}`,

      text: [
        `Hola ${pedido.nombreCliente},`,
        "",
        `Tu pago fue aprobado correctamente.`,
        `Pedido: ${pedido.numero}`,
        `Total: ${formatearPrecio(pedido.total)}`,
        "",
        "Adjuntamos el documento correspondiente a tu compra.",
        "",
        "Econnet",
      ].join("\n"),

      html: construirCorreoHtml(pedido),

      attachments: [
        {
          filename: nombreArchivo,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    await prisma.pedido.update({
      where: {
        id,
      },
      data: {
        documentoEmailEstado: "enviado",
        fechaDocumentoEmail: new Date(),
        errorDocumentoEmail: null,

        documentoPdfGenerado: true,
        fechaDocumentoPdf: new Date(),
      },
    });

    return {
      ok: true,
      omitido: false,
      messageId: info.messageId,
    };
  } catch (error) {
    logger.error("Error enviando documento por correo:", serializeError(error));

    await prisma.pedido.updateMany({
      where: {
        id,
      },
      data: {
        documentoEmailEstado: "error",
        errorDocumentoEmail: String(
          error.message || "Error desconocido al enviar correo",
        ).slice(0, 1000),
      },
    });

    throw error;
  }
}