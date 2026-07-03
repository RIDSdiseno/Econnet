import "dotenv/config";
import logger, { serializeError } from "../src/config/logger.js";
import { enviarDocumentoPedidoPorCorreo } from "../src/services/emailService.js";

const pedidoId = Number(process.argv[2]);

if (!pedidoId) {
  logger.error("Debes indicar el ID del pedido. Ejemplo:");
  logger.error("node scripts/enviarDocumentoPedido.js 110");
  process.exit(1);
}

try {
  const resultado = await enviarDocumentoPedidoPorCorreo(pedidoId);

  logger.info("Resultado envío comprobante", {
    omitido: resultado?.omitido ?? null,
    mensaje: resultado?.mensaje || null,
    pedidoId,
  });
} catch (error) {
  logger.error("Error enviando comprobante", serializeError(error));
  process.exit(1);
}
