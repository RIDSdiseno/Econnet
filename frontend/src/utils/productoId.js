export function normalizarProductoId(id) {
  if (id === null || id === undefined || id === "") {
    return null;
  }

  // Acepta "51" o "51-nombre-del-producto" → extrae la parte numérica inicial
  const str = String(id);
  const match = str.match(/^(\d+)/);
  const productoId = match ? Number(match[1]) : NaN;

  if (!Number.isInteger(productoId) || productoId <= 0) {
    return null;
  }

  return productoId;
}

export function esProductoIdValido(id) {
  return normalizarProductoId(id) !== null;
}

/** Genera el slug SEO a partir del nombre del producto. */
export function slugificarProducto(nombre = "") {
  return String(nombre)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-{2,}/g, "-")
    .substring(0, 70)
    .replace(/-$/, "");
}

/** Crea la ruta canónica del detalle de un producto, con slug si se provee el nombre. */
export function crearRutaDetalleProducto(id, nombre) {
  const productoId = normalizarProductoId(id);
  if (!productoId) return null;

  if (nombre) {
    const slug = slugificarProducto(nombre);
    return slug ? `/producto/${productoId}-${slug}` : `/producto/${productoId}`;
  }

  return `/producto/${productoId}`;
}
