import "dotenv/config";
import { enviarDocumentoPedidoPorCorreo } from "../src/services/emailService.js";

const pedidoId = Number(process.argv[2]);

if (!pedidoId) {
  console.error("Debes indicar el ID del pedido. Ejemplo:");
  console.error("node scripts/enviarDocumentoPedido.js 110");
  process.exit(1);
}

try {
  const resultado = await enviarDocumentoPedidoPorCorreo(pedidoId);

  console.log("Resultado envío comprobante:", resultado);
} catch (error) {
  console.error("Error enviando comprobante:", error.message);
  process.exit(1);
}