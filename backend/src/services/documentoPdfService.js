import PDFDocument from "pdfkit";

function formatearPrecio(valor) {
    return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0,
    }).format(valor || 0);
}

function formatearFecha(fecha) {
    if (!fecha) return "No registrada";

    return new Date(fecha).toLocaleString("es-CL", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatearMetodoPago(metodo) {
    const metodos = {
        transferencia: "Transferencia bancaria",
        webpay: "Webpay / Tarjeta",
        oneclick: "Tarjeta guardada / Oneclick",
        mercadopago: "Mercado Pago",
    };

    return metodos[metodo] || metodo || "No informado";
}

function obtenerTituloDocumento(pedido) {
    if (pedido.documento === "factura") {
        return {
            titulo: "FACTURA PROFORMA",
            subtitulo: "Documento no tributario",
        };
    }

    return {
        titulo: "COMPROBANTE DE COMPRA",
        subtitulo: "Documento no tributario",
    };
}

function escribirFila(doc, label, value, xLabel = 60, xValue = 390) {
    doc.font("Helvetica-Bold").fontSize(9).text(label, xLabel, doc.y);
    doc.font("Helvetica").fontSize(9).text(value || "-", xValue, doc.y - 11, {
        width: 150,
        align: "right",
    });
    doc.moveDown(0.5);
}

function escribirLinea(doc) {
    doc
        .moveTo(60, doc.y)
        .lineTo(535, doc.y)
        .strokeColor("#dddddd")
        .stroke();

    doc.moveDown(1);
}

export function generarDocumentoPedidoPDF(pedido) {
    return new Promise((resolve, reject) => {
        try {
            const chunks = [];
            const doc = new PDFDocument({
                size: "A4",
                margin: 50,
            });

            doc.on("data", (chunk) => chunks.push(chunk));
            doc.on("end", () => resolve(Buffer.concat(chunks)));
            doc.on("error", reject);

            const { titulo, subtitulo } = obtenerTituloDocumento(pedido);

            // Header
            doc
                .rect(0, 0, 595, 105)
                .fill("#030712");

            doc
                .fillColor("#ffffff")
                .font("Helvetica-Bold")
                .fontSize(24)
                .text("ECONNET", 60, 35);

            doc
                .font("Helvetica")
                .fontSize(9)
                .text("Domina la tecnología", 60, 65);

            doc
                .font("Helvetica-Bold")
                .fontSize(15)
                .text(titulo, 300, 32, {
                    width: 235,
                    align: "right",
                });

            doc
                .font("Helvetica")
                .fontSize(10)
                .text(subtitulo, 300, 55, {
                    width: 235,
                    align: "right",
                });

            doc
                .fontSize(8)
                .text(
                    "Este documento es solo un comprobante interno de compra. No corresponde a una boleta o factura electrónica emitida ante el SII.",
                    300,
                    72,
                    {
                        width: 235,
                        align: "right",
                    },
                );

            doc.fillColor("#111827");
            doc.y = 135;

            // Datos del pedido
            doc.font("Helvetica-Bold").fontSize(14).text("Datos del pedido");
            doc.moveDown(0.8);

            escribirFila(doc, "N° pedido", pedido.numero);
            escribirFila(doc, "Fecha pedido", formatearFecha(pedido.createdAt));
            escribirFila(doc, "Fecha pago", formatearFecha(pedido.fechaPago));
            escribirFila(doc, "Método pago", formatearMetodoPago(pedido.metodoPago));
            escribirFila(doc, "Estado pago", pedido.estadoPago?.toUpperCase());

            escribirLinea(doc);

            // Cliente
            doc.font("Helvetica-Bold").fontSize(14).text("Cliente");
            doc.moveDown(0.8);

            escribirFila(doc, "Nombre", pedido.nombreCliente);
            escribirFila(doc, "Correo", pedido.emailCliente);
            escribirFila(doc, "Teléfono", pedido.telefonoCliente || "No registrado");

            if (pedido.tipoEntrega === "retiro") {
                escribirFila(doc, "Entrega", "Retiro en tienda Econnet");
            } else {
                escribirFila(
                    doc,
                    "Dirección",
                    `${pedido.direccionTexto || ""}, ${pedido.comuna || ""}, ${pedido.region || ""
                    }`,
                );
            }

            escribirLinea(doc);

            // Datos factura
            if (pedido.documento === "factura") {
                doc.font("Helvetica-Bold").fontSize(14).text("Datos de facturación");
                doc.moveDown(0.8);

                escribirFila(doc, "RUT", pedido.rutFacturacion);
                escribirFila(doc, "Razón social", pedido.razonSocialFacturacion);
                escribirFila(doc, "Giro", pedido.giroFacturacion);
                escribirFila(doc, "Dirección", pedido.direccionFacturacion);
                escribirFila(doc, "Comuna", pedido.comunaFacturacion);
                escribirFila(doc, "Ciudad", pedido.ciudadFacturacion);

                escribirLinea(doc);
            }

            // Productos
            doc.font("Helvetica-Bold").fontSize(14).text("Detalle de productos");
            doc.moveDown(0.8);

            const tableTop = doc.y;

            doc
                .font("Helvetica-Bold")
                .fontSize(9)
                .text("Producto", 60, tableTop)
                .text("Cant.", 330, tableTop, { width: 40, align: "right" })
                .text("Precio", 385, tableTop, { width: 70, align: "right" })
                .text("Subtotal", 465, tableTop, { width: 70, align: "right" });

            doc.moveDown(0.8);
            doc
                .moveTo(60, doc.y)
                .lineTo(535, doc.y)
                .strokeColor("#dddddd")
                .stroke();

            doc.moveDown(0.7);

            pedido.items.forEach((item) => {
                const y = doc.y;

                doc
                    .font("Helvetica")
                    .fontSize(9)
                    .text(item.nombreProducto, 60, y, { width: 250 });

                doc
                    .text(String(item.cantidad), 330, y, { width: 40, align: "right" })
                    .text(formatearPrecio(item.precioUnitario), 385, y, {
                        width: 70,
                        align: "right",
                    })
                    .text(formatearPrecio(item.subtotal), 465, y, {
                        width: 70,
                        align: "right",
                    });

                doc.moveDown(1.2);
            });

            escribirLinea(doc);

            // Totales
            doc.font("Helvetica-Bold").fontSize(14).text("Resumen");
            doc.moveDown(0.8);

            escribirFila(doc, "Subtotal", formatearPrecio(pedido.subtotal));
            escribirFila(doc, "Descuento", `-${formatearPrecio(pedido.descuento)}`);
            escribirFila(doc, "Despacho", formatearPrecio(pedido.despacho));
            escribirFila(doc, "Neto", formatearPrecio(pedido.neto));
            escribirFila(doc, "IVA incluido 19%", formatearPrecio(pedido.iva));

            doc.moveDown(0.5);

            doc
                .font("Helvetica-Bold")
                .fontSize(13)
                .text("Total", 60, doc.y)
                .text(formatearPrecio(pedido.total), 390, doc.y - 15, {
                    width: 150,
                    align: "right",
                });

            doc.moveDown(2);

            // Footer
            doc
                .font("Helvetica")
                .fontSize(8)
                .fillColor("#6b7280")
                .text(
                    "Documento generado automáticamente por Econnet. No posee validez tributaria ante el SII.",
                    60,
                    760,
                    {
                        width: 475,
                        align: "center",
                    },
                );

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}