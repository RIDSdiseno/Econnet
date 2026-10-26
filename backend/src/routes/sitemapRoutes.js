import { Router } from "express";
import prisma from "../config/prisma.js";

const router = Router();

const SITE = "https://econnet.cl";

function xmlUrl(loc, lastmod, changefreq, priority) {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

router.get("/sitemap.xml", async (req, res) => {
  try {
    const hoy = new Date().toISOString().split("T")[0];

    const [productos, categorias] = await Promise.all([
      prisma.producto.findMany({
        where: { activo: true },
        select: { id: true, slug: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.categoria.findMany({
        where: {
          activo: true,
          productos: { some: { activo: true } },
        },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    const staticPages = [
      xmlUrl(`${SITE}/`, hoy, "daily", "1.0"),
      xmlUrl(`${SITE}/productos`, hoy, "daily", "0.9"),
      xmlUrl(`${SITE}/quienes-somos`, hoy, "monthly", "0.5"),
      xmlUrl(`${SITE}/contacto`, hoy, "monthly", "0.6"),
      xmlUrl(`${SITE}/centro-ayuda`, hoy, "monthly", "0.5"),
      xmlUrl(`${SITE}/terminos-condiciones`, hoy, "yearly", "0.3"),
      xmlUrl(`${SITE}/politicas-privacidad`, hoy, "yearly", "0.3"),
    ];

    const categoriaPages = categorias.map((c) =>
      xmlUrl(
        `${SITE}/productos?categoria=${c.slug}`,
        c.updatedAt.toISOString().split("T")[0],
        "weekly",
        "0.8",
      )
    );

    const productoPages = productos.map((p) =>
      xmlUrl(
        `${SITE}/producto/${p.id}-${p.slug}`,
        p.updatedAt.toISOString().split("T")[0],
        "weekly",
        "0.9",
      )
    );

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticPages, ...categoriaPages, ...productoPages].join("\n")}
</urlset>`;

    res.set("Content-Type", "application/xml");
    res.set("Cache-Control", "public, max-age=3600");
    res.send(xml);
  } catch (error) {
    res.status(500).send("Error al generar el sitemap");
  }
});

export default router;
