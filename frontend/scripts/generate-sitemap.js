import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SITE = "https://econnet.cl";
const API_URL = process.env.VITE_API_URL || "https://econnet-production.up.railway.app/api";
const OUT = path.resolve(__dirname, "../public/sitemap.xml");

function xmlUrl(loc, lastmod, changefreq, priority) {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

async function fetchJson(endpoint) {
  const res = await fetch(`${API_URL}${endpoint}`);
  if (!res.ok) throw new Error(`Error ${res.status} en ${endpoint}`);
  return res.json();
}

async function main() {
  const hoy = new Date().toISOString().split("T")[0];
  console.log(`[sitemap] Generando sitemap para ${SITE}...`);

  const staticPages = [
    xmlUrl(`${SITE}/`, hoy, "daily", "1.0"),
    xmlUrl(`${SITE}/productos`, hoy, "daily", "0.9"),
    xmlUrl(`${SITE}/quienes-somos`, hoy, "monthly", "0.5"),
    xmlUrl(`${SITE}/contacto`, hoy, "monthly", "0.6"),
    xmlUrl(`${SITE}/centro-ayuda`, hoy, "monthly", "0.5"),
    xmlUrl(`${SITE}/terminos-condiciones`, hoy, "yearly", "0.3"),
    xmlUrl(`${SITE}/politicas-privacidad`, hoy, "yearly", "0.3"),
  ];

  let categoriaPages = [];
  let productoPages = [];

  try {
    const catData = await fetchJson("/categorias");
    const categorias = Array.isArray(catData) ? catData : catData.categorias ?? [];
    categoriaPages = categorias
      .filter((c) => c.activo !== false)
      .map((c) =>
        xmlUrl(
          `${SITE}/productos?categoria=${c.slug}`,
          hoy,
          "weekly",
          "0.8",
        )
      );
    console.log(`[sitemap] ${categoriaPages.length} categorías`);
  } catch (e) {
    console.warn("[sitemap] No se pudieron obtener categorías:", e.message);
  }

  try {
    const prodData = await fetchJson("/productos?limit=1000&activo=true");
    const productos = Array.isArray(prodData) ? prodData : prodData.productos ?? [];
    productoPages = productos.map((p) => {
      const lastmod = p.updatedAt
        ? new Date(p.updatedAt).toISOString().split("T")[0]
        : hoy;

      // Usa el slug de la API; si no existe, lo genera desde el nombre
      const slugBase = p.slug || (p.nombre
        ? p.nombre.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
            .replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-{2,}/g, "-").substring(0, 70)
        : "");

      const urlProducto = slugBase
        ? `${SITE}/producto/${p.id}-${slugBase}`
        : `${SITE}/producto/${p.id}`;

      return xmlUrl(urlProducto, lastmod, "weekly", "0.9");
    });
    console.log(`[sitemap] ${productoPages.length} productos`);
  } catch (e) {
    console.warn("[sitemap] No se pudieron obtener productos:", e.message);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticPages, ...categoriaPages, ...productoPages].join("\n")}
</urlset>`;

  fs.writeFileSync(OUT, xml, "utf-8");
  const total = staticPages.length + categoriaPages.length + productoPages.length;
  console.log(`[sitemap] ✓ sitemap.xml generado con ${total} URLs → ${OUT}`);
}

main().catch((e) => {
  console.error("[sitemap] Error:", e.message);
  process.exit(1);
});
