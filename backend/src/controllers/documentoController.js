import prisma from "../config/prisma.js";
import { generarDocumentoPedidoPDF } from "../services/documentoPdfService.js";

function limpiarNombreArchivo(texto = "") {
  return String(texto).replace(/[^a-zA-Z0-9-_]/g, "_");
}

export async function descargarDocumentoPedido(req, res) {
  try {
    const pedidoId = Number(req.params.id);

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
      },
    });

    if (!pedido) {
      return res.status(404).json({
        ok: false,
        mensaje: "Pedido no encontrado",
      });
    }

    if (pedido.estadoPago !== "aprobado") {
      return res.status(400).json({
        ok: false,
        mensaje:
          "El documento solo puede generarse cuando el pago esté aprobado",
      });
    }

    if (!["boleta", "factura"].includes(pedido.documento)) {
      return res.status(400).json({
        ok: false,
        mensaje: "Tipo de documento inválido",
      });
    }

    if (pedido.documento === "factura") {
      const datosFacturaCompletos =
        pedido.rutFacturacion &&
        pedido.razonSocialFacturacion &&
        pedido.giroFacturacion &&
        pedido.direccionFacturacion &&
        pedido.comunaFacturacion &&
        pedido.ciudadFacturacion;

      if (!datosFacturaCompletos) {
        return res.status(400).json({
          ok: false,
          mensaje: "Faltan datos para generar la factura proforma",
        });
      }
    }

    const pdfBuffer = await generarDocumentoPedidoPDF(pedido);

    await prisma.pedido.update({
      where: {
        id: pedido.id,
      },
      data: {
        documentoPdfGenerado: true,
        fechaDocumentoPdf: new Date(),
      },
    });

    const tipoArchivo =
      pedido.documento === "factura"
        ? "factura-proforma"
        : "comprobante-compra";

    const nombreArchivo = `${tipoArchivo}-${limpiarNombreArchivo(
      pedido.numero,
    )}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${nombreArchivo}"`,
    );
    res.setHeader("Content-Length", pdfBuffer.length);

    return res.send(pdfBuffer);
  } catch (error) {
    console.error("Error al generar documento PDF:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "No se pudo generar el documento PDF",
      error: error.message,
    });
  }
}