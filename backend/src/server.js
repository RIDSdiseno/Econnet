import "dotenv/config";
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

import authGoogleRoutes from "./routes/authGoogleRoutes.js";

const app = express();

const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

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
app.use("/api/despacho", despachoRoutes);

app.use("/api/admin/pedidos", adminPedidoRoutes);
app.use("/api/admin/tarifas", adminTarifaRoutes);
app.use("/api/admin/categorias", adminCategoriaRoutes);
app.use("/api/admin/marcas", adminMarcaRoutes);
app.use("/api/admin/productos", adminProductoRoutes);
app.use("/api/admin/anuncios", adminAnuncioRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin/usuarios", adminUsuarioRoutes);

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

  console.error("Error no controlado:", error);

  return res.status(500).json({
    ok: false,
    mensaje: "Error interno del servidor",
    error: error.message,
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});