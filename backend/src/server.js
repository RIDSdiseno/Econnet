import "dotenv/config";
import logger, { serializeError } from "./config/logger.js";
import express from "express";
import cors from "cors";
import prisma from "./config/prisma.js";

import productoRoutes from "./routes/productoRoutes.js";
import categoriaRoutes from "./routes/categoriaRoutes.js";
import marcaRoutes from "./routes/marcaRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import anuncioRoutes from "./routes/anuncioRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import authMicrosoftRoutes from "./routes/authMicrosoftRoutes.js";

import direccionRoutes from "./routes/direccionRoutes.js";
import favoritoRoutes from "./routes/favoritoRoutes.js";
import carritoRoutes from "./routes/carritoRoutes.js";
import pedidoRoutes from "./routes/pedidoRoutes.js";
import despachoRoutes from "./routes/despachoRoutes.js";

import adminPedidoRoutes from "./routes/adminPedidoRoutes.js";
import adminTarifaRoutes from "./routes/adminTarifaRoutes.js";
import adminCategoriaRoutes from "./routes/adminCategoriaRoutes.js";
import adminMarcaRoutes from "./routes/adminMarcaRoutes.js";
import adminProductoRoutes from "./routes/adminProductoRoutes.js";
import adminDashboardRoutes from "./routes/adminDashboardRoutes.js";
import adminAnuncioRoutes from "./routes/adminAnuncioRoutes.js";
import adminUsuarioRoutes from "./routes/adminUsuarioRoutes.js";

import newsletterRoutes from "./routes/newsletterRoutes.js";

import pagoRoutes from "./routes/pagoRoutes.js";

import medioPagoRoutes from "./routes/medioPagoRoutes.js";

import authGoogleRoutes from "./routes/authGoogleRoutes.js";

import documentoRoutes from "./routes/documentoRoutes.js";

import { iniciarRevisionPedidosVencidos } from "./services/pedidoVencimientoService.js";

import soporteRoutes from "./routes/soporteRoutes.js";

import adminSoporteRoutes from "./routes/adminSoporteRoutes.js";

import adminProductosVendidosRoutes from "./routes/adminProductosVendidosRoutes.js";

import adminEnvioRoutes from "./routes/adminEnvioRoutes.js";

const app = express();
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

const PORT = Number(process.env.PORT) || 3000;

const origenesPermitidos = [
  "http://localhost:5173",
  "https://econnet-store.netlify.app",
  "https://econnet.cl",
  process.env.FRONTEND_URL,
]
  .filter(Boolean)
  .map((origen) => origen.trim().replace(/\/+$/, ""));

logger.info("Orígenes permitidos por CORS:", origenesPermitidos);

const corsOptions = {
  origin: (origin, callback) => {
    /*
     * Permitimos solicitudes sin Origin para:
     * - Webhooks de Mercado Pago
     * - Health checks de Railway
     * - Postman y otros clientes servidor a servidor
     */
    if (!origin) {
      return callback(null, true);
    }

    const origenNormalizado = origin.replace(/\/+$/, "");

    if (origenesPermitidos.includes(origenNormalizado)) {
      return callback(null, true);
    }

    logger.warn(`Origen bloqueado por CORS: ${origin}`);

    return callback(
      new Error(`El origen ${origin} no está permitido por CORS`)
    );
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],
};

app.use(cors(corsOptions));

app.use(express.json());

app.use("/api/productos", productoRoutes);
app.use("/api/categorias", categoriaRoutes);
app.use("/api/marcas", marcaRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/anuncios", anuncioRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/auth", authMicrosoftRoutes);
app.use("/api/auth", authGoogleRoutes);

app.use("/api/direcciones", direccionRoutes);
app.use("/api/favoritos", favoritoRoutes);
app.use("/api/carrito", carritoRoutes);
app.use("/api/pedidos", pedidoRoutes);
app.use("/api/pagos", pagoRoutes);
app.use("/api/medios-pago", medioPagoRoutes);
app.use("/api/despacho", despachoRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/documentos", documentoRoutes);
app.use("/api/soporte", soporteRoutes);

app.use("/api/admin/pedidos", adminPedidoRoutes);
app.use("/api/admin/tarifas", adminTarifaRoutes);
app.use("/api/admin/categorias", adminCategoriaRoutes);
app.use("/api/admin/marcas", adminMarcaRoutes);
app.use("/api/admin/productos", adminProductoRoutes);
app.use("/api/admin/anuncios", adminAnuncioRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin/usuarios", adminUsuarioRoutes);
app.use("/api/admin/soporte", adminSoporteRoutes);
app.use("/api/admin/productos-vendidos", adminProductosVendidosRoutes);
app.use("/api/admin/envios", adminEnvioRoutes);

app.get("/", (req, res) => {
  res.send("Backend de Econnet funcionando correctamente");
});

app.get("/api/test", async (req, res) => {
  try {
    await prisma.$connect();

    res.json({
      ok: true,
      mensaje: "API de Econnet funcionando correctamente",
      database: "Conexión con Prisma correcta",
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: "Error al conectar con la base de datos",
      error: error.message,
    });
  }
});

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({
      ok: false,
      mensaje: "El body enviado no es un JSON válido",
      error: error.message,
    });
  }

  logger.error("Error no controlado", serializeError(error));

  return res.status(500).json({
    ok: false,
    mensaje: "Error interno del servidor",
    error: error.message,
  });
});



app.listen(PORT, "0.0.0.0", () => {
  logger.info(`Servidor ejecutándose en el puerto ${PORT}`);

  iniciarRevisionPedidosVencidos();
});


