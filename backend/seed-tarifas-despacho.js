import logger, { serializeError } from "./src/config/logger.js";
import prisma from "./src/config/prisma.js";

async function main() {
  const tarifas = [
    {
      codigo: "GRAN_SANTIAGO",
      nombre: "Gran Santiago",
      precio: 3990,
    },
    {
      codigo: "RM_OTRAS",
      nombre: "Otras comunas Región Metropolitana",
      precio: 4990,
    },
    {
      codigo: "CENTRO",
      nombre: "Regiones centro",
      precio: 8990,
    },
    {
      codigo: "INTERMEDIA",
      nombre: "Regiones intermedias",
      precio: 10990,
    },
    {
      codigo: "EXTREMA",
      nombre: "Regiones extremas",
      precio: 14990,
    },
  ];

  for (const tarifa of tarifas) {
    await prisma.tarifaDespacho.upsert({
      where: {
        codigo: tarifa.codigo,
      },
      update: {
        nombre: tarifa.nombre,
        precio: tarifa.precio,
        activo: true,
      },
      create: tarifa,
    });
  }

  logger.info("Tarifas de despacho creadas/actualizadas correctamente");
}

main()
  .catch((error) => {
    logger.error("Error al crear tarifas de despacho", serializeError(error));
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
