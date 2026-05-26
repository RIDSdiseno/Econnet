import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import prisma from "./config/prisma.js";
import productoRoutes from "./routes/productoRoutes.js";
import categoriaRoutes from "./routes/categoriaRoutes.js";
import marcaRoutes from "./routes/marcaRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());

app.use("/api/productos", productoRoutes);
app.use("/api/categorias", categoriaRoutes);
app.use("/api/marcas", marcaRoutes);
app.use("/api/upload", uploadRoutes);

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

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});