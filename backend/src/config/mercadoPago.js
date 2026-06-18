import "dotenv/config";
import {
  MercadoPagoConfig,
  Preference,
  Payment,
} from "mercadopago";

const accessToken =
  process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();

if (!accessToken) {
  throw new Error(
    "Falta configurar MERCADOPAGO_ACCESS_TOKEN en backend/.env",
  );
}

const clienteMercadoPago = new MercadoPagoConfig({
  accessToken,
  options: {
    timeout: 10000,
  },
});

export const preferenciasMercadoPago =
  new Preference(clienteMercadoPago);

export const pagosMercadoPago =
  new Payment(clienteMercadoPago);

export default clienteMercadoPago;