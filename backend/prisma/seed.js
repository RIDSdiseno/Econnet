import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const notebooks = await prisma.categoria.upsert({
    where: { slug: "notebooks" },
    update: {},
    create: {
      nombre: "Notebooks",
      slug: "notebooks",
      descripcion: "Computadores portátiles para estudio, trabajo y gaming",
    },
  });

  const monitores = await prisma.categoria.upsert({
    where: { slug: "monitores" },
    update: {},
    create: {
      nombre: "Monitores",
      slug: "monitores",
      descripcion: "Monitores para trabajo, estudio y entretenimiento",
    },
  });

  const almacenamiento = await prisma.categoria.upsert({
    where: { slug: "almacenamiento" },
    update: {},
    create: {
      nombre: "Almacenamiento",
      slug: "almacenamiento",
      descripcion: "Discos SSD, HDD y unidades de almacenamiento",
    },
  });

  const camaras = await prisma.categoria.upsert({
    where: { slug: "camaras-seguridad" },
    update: {},
    create: {
      nombre: "Cámaras de seguridad",
      slug: "camaras-seguridad",
      descripcion: "Cámaras de seguridad para hogar, oficina y negocio",
    },
  });

  const marcasSeed = [
    {
      nombre: "Apple",
      logoUrl: "/img/marcas/apple.png",
      activo: true,
      mostrarHome: true,
      grupo: "principal",
      orden: 1,
    },
    {
      nombre: "ASUS",
      logoUrl: "/img/marcas/asus.png",
      activo: true,
      mostrarHome: true,
      grupo: "principal",
      orden: 2,
    },
    {
      nombre: "Dell",
      logoUrl: "/img/marcas/dell.png",
      activo: true,
      mostrarHome: true,
      grupo: "principal",
      orden: 3,
    },
    {
      nombre: "HP",
      logoUrl: "/img/marcas/hp.png",
      activo: true,
      mostrarHome: true,
      grupo: "principal",
      orden: 4,
    },
    {
      nombre: "Lenovo",
      logoUrl: "/img/marcas/lenovo.png",
      activo: true,
      mostrarHome: true,
      grupo: "principal",
      orden: 5,
    },
    {
      nombre: "Samsung",
      logoUrl: "/img/marcas/samsung.png",
      activo: true,
      mostrarHome: true,
      grupo: "principal",
      orden: 6,
    },
    {
      nombre: "Kingston",
      logoUrl: "/img/marcas/kingston.png",
      activo: true,
      mostrarHome: true,
      grupo: "otras",
      orden: 7,
    },
    {
      nombre: "EZVIZ",
      logoUrl: "/img/marcas/ezviz.png",
      activo: true,
      mostrarHome: true,
      grupo: "otras",
      orden: 8,
    },
  ];

  const marcasCreadas = {};

  for (const marcaData of marcasSeed) {
    const marca = await prisma.marca.upsert({
      where: {
        nombre: marcaData.nombre,
      },
      update: marcaData,
      create: marcaData,
    });

    marcasCreadas[marcaData.nombre] = marca;
  }

  const apple = marcasCreadas["Apple"];
  const asus = marcasCreadas["ASUS"];
  const dell = marcasCreadas["Dell"];
  const hp = marcasCreadas["HP"];
  const lenovo = marcasCreadas["Lenovo"];
  const samsung = marcasCreadas["Samsung"];
  const kingston = marcasCreadas["Kingston"];
  const ezviz = marcasCreadas["EZVIZ"];
  const notebook = await prisma.producto.upsert({
    where: { slug: "notebook-hp-ryzen-5" },
    update: {},
    create: {
      nombre: "Notebook HP Ryzen 5",
      slug: "notebook-hp-ryzen-5",
      descripcion: "Notebook ideal para estudio, trabajo y uso diario.",
      precio: 599990,
      stock: 10,
      sku: "HP-R5-512-001",
      modelo: "HP Ryzen 5",
      garantia: "12 meses",
      categoriaId: notebooks.id,
      marcaId: hp.id,
      imagenes: {
        create: [
          {
            url: "https://via.placeholder.com/500x500?text=Notebook+HP",
            publicId: "demo/notebook-hp",
            esPrincipal: true,
            orden: 1,
          },
        ],
      },
      especificaciones: {
        create: [
          { nombre: "Procesador", valor: "AMD Ryzen 5", orden: 1 },
          { nombre: "RAM", valor: "16GB", orden: 2 },
          { nombre: "Almacenamiento", valor: "512GB SSD", orden: 3 },
          { nombre: "Pantalla", valor: "15.6 pulgadas", orden: 4 },
          { nombre: "Sistema operativo", valor: "Windows 11", orden: 5 },
        ],
      },
    },
  });

  const monitor = await prisma.producto.upsert({
    where: { slug: "monitor-samsung-24-full-hd" },
    update: {},
    create: {
      nombre: "Monitor Samsung 24 Full HD",
      slug: "monitor-samsung-24-full-hd",
      descripcion: "Monitor de 24 pulgadas ideal para oficina, estudio y uso diario.",
      precio: 129990,
      stock: 15,
      sku: "SAM-MON-24-001",
      modelo: "Samsung 24 FHD",
      garantia: "12 meses",
      categoriaId: monitores.id,
      marcaId: samsung.id,
      imagenes: {
        create: [
          {
            url: "https://via.placeholder.com/500x500?text=Monitor+Samsung",
            publicId: "demo/monitor-samsung",
            esPrincipal: true,
            orden: 1,
          },
        ],
      },
      especificaciones: {
        create: [
          { nombre: "Tamaño", valor: "24 pulgadas", orden: 1 },
          { nombre: "Resolución", valor: "Full HD", orden: 2 },
          { nombre: "Panel", valor: "IPS", orden: 3 },
          { nombre: "Conectividad", valor: "HDMI / VGA", orden: 4 },
        ],
      },
    },
  });

  const ssd = await prisma.producto.upsert({
    where: { slug: "ssd-kingston-1tb" },
    update: {},
    create: {
      nombre: "SSD Kingston 1TB",
      slug: "ssd-kingston-1tb",
      descripcion: "Unidad SSD de alto rendimiento para mejorar la velocidad del equipo.",
      precio: 74990,
      stock: 25,
      sku: "KIN-SSD-1TB-001",
      modelo: "Kingston NV2",
      garantia: "24 meses",
      categoriaId: almacenamiento.id,
      marcaId: kingston.id,
      imagenes: {
        create: [
          {
            url: "https://via.placeholder.com/500x500?text=SSD+Kingston",
            publicId: "demo/ssd-kingston",
            esPrincipal: true,
            orden: 1,
          },
        ],
      },
      especificaciones: {
        create: [
          { nombre: "Capacidad", valor: "1TB", orden: 1 },
          { nombre: "Tipo", valor: "SSD NVMe", orden: 2 },
          { nombre: "Formato", valor: "M.2", orden: 3 },
        ],
      },
    },
  });

  const camara = await prisma.producto.upsert({
    where: { slug: "camara-seguridad-ezviz-wifi" },
    update: {},
    create: {
      nombre: "Cámara de Seguridad EZVIZ WiFi",
      slug: "camara-seguridad-ezviz-wifi",
      descripcion: "Cámara de seguridad WiFi para monitoreo de hogar o negocio.",
      precio: 39990,
      stock: 30,
      sku: "EZV-CAM-WIFI-001",
      modelo: "EZVIZ WiFi 1080p",
      garantia: "12 meses",
      categoriaId: camaras.id,
      marcaId: ezviz.id,
      imagenes: {
        create: [
          {
            url: "https://via.placeholder.com/500x500?text=Camara+Seguridad",
            publicId: "demo/camara-ezviz",
            esPrincipal: true,
            orden: 1,
          },
        ],
      },
      especificaciones: {
        create: [
          { nombre: "Resolución", valor: "1080p", orden: 1 },
          { nombre: "Conectividad", valor: "WiFi", orden: 2 },
          { nombre: "Visión nocturna", valor: "Sí", orden: 3 },
          { nombre: "Uso", valor: "Interior", orden: 4 },
        ],
      },
    },
  });

  console.log("Datos de prueba creados correctamente");
  console.log({ notebook: notebook.nombre, monitor: monitor.nombre, ssd: ssd.nombre, camara: camara.nombre });
}

main()
  .catch((error) => {
    console.error("Error al crear datos de prueba:", error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });