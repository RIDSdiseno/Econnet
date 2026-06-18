const CLAVE_CARRITO_INVITADO = "econnet_carrito_invitado";

const normalizarItems = (items) => {
  if (!Array.isArray(items)) return [];

  const mapa = new Map();

  for (const item of items) {
    const productoId = Number(item.productoId || item.id);
    const cantidad = Number(item.cantidad);

    if (!Number.isInteger(productoId) || productoId <= 0) continue;
    if (!Number.isInteger(cantidad) || cantidad <= 0) continue;

    mapa.set(productoId, (mapa.get(productoId) || 0) + cantidad);
  }

  return Array.from(mapa.entries()).map(([productoId, cantidad]) => ({
    productoId,
    cantidad,
  }));
};

export const obtenerCarritoInvitado = () => {
  try {
    const carritoGuardado = localStorage.getItem(CLAVE_CARRITO_INVITADO);

    if (!carritoGuardado) return [];

    const items = JSON.parse(carritoGuardado);

    return normalizarItems(items);
  } catch {
    localStorage.removeItem(CLAVE_CARRITO_INVITADO);
    return [];
  }
};

export const guardarCarritoInvitado = (items) => {
  const itemsNormalizados = normalizarItems(items);

  localStorage.setItem(
    CLAVE_CARRITO_INVITADO,
    JSON.stringify(itemsNormalizados),
  );

  window.dispatchEvent(new Event("carritoInvitadoActualizado"));

  return itemsNormalizados;
};

export const agregarItemCarritoInvitado = (productoId, cantidad = 1) => {
  const id = Number(productoId);
  const cantidadAgregar = Number(cantidad);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Producto inválido");
  }

  if (!Number.isInteger(cantidadAgregar) || cantidadAgregar <= 0) {
    throw new Error("Cantidad inválida");
  }

  const carritoActual = obtenerCarritoInvitado();

  const itemExistente = carritoActual.find((item) => item.productoId === id);

  if (itemExistente) {
    itemExistente.cantidad += cantidadAgregar;
  } else {
    carritoActual.push({
      productoId: id,
      cantidad: cantidadAgregar,
    });
  }

  return guardarCarritoInvitado(carritoActual);
};

export const actualizarCantidadCarritoInvitado = (productoId, cantidad) => {
  const id = Number(productoId);
  const nuevaCantidad = Number(cantidad);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Producto inválido");
  }

  if (!Number.isInteger(nuevaCantidad) || nuevaCantidad <= 0) {
    throw new Error("Cantidad inválida");
  }

  const carritoActual = obtenerCarritoInvitado();

  const carritoActualizado = carritoActual.map((item) =>
    item.productoId === id
      ? {
          ...item,
          cantidad: nuevaCantidad,
        }
      : item,
  );

  return guardarCarritoInvitado(carritoActualizado);
};

export const eliminarItemCarritoInvitado = (productoId) => {
  const id = Number(productoId);

  const carritoActual = obtenerCarritoInvitado();

  const carritoActualizado = carritoActual.filter(
    (item) => item.productoId !== id,
  );

  return guardarCarritoInvitado(carritoActualizado);
};

export const vaciarCarritoInvitado = () => {
  localStorage.removeItem(CLAVE_CARRITO_INVITADO);
  window.dispatchEvent(new Event("carritoInvitadoActualizado"));
};

export const contarItemsCarritoInvitado = () => {
  return obtenerCarritoInvitado().reduce(
    (total, item) => total + item.cantidad,
    0,
  );
};