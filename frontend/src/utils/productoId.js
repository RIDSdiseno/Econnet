export function normalizarProductoId(id) {
  if (id === null || id === undefined || id === "") {
    return null;
  }

  const productoId = Number(id);

  if (!Number.isInteger(productoId) || productoId <= 0) {
    return null;
  }

  return productoId;
}

export function esProductoIdValido(id) {
  return normalizarProductoId(id) !== null;
}

export function crearRutaDetalleProducto(id) {
  const productoId = normalizarProductoId(id);

  return productoId ? `/producto/${productoId}` : null;
}
