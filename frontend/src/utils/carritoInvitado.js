const CLAVE_CARRITO_INVITADO = "econnet_carrito_invitado";
const EVENTOS_CARRITO = ["carritoInvitadoActualizado", "carritoActualizado"];

const obtenerLocalStorage = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage || null;
  } catch (error) {
    avisarEnDesarrollo("localStorage no está disponible.", error);
    return null;
  }
};

const avisarEnDesarrollo = (mensaje, error) => {
  if (import.meta.env?.DEV && typeof console !== "undefined") {
    console.warn(mensaje, error);
  }
};

const notificarCarritoActualizado = () => {
  if (
    typeof window === "undefined" ||
    typeof window.dispatchEvent !== "function" ||
    typeof window.Event !== "function"
  ) {
    return;
  }

  EVENTOS_CARRITO.forEach((nombreEvento) => {
    window.dispatchEvent(new window.Event(nombreEvento));
  });
};

const convertirEnteroPositivo = (valor) => {
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  const numero = Number(valor);

  if (!Number.isFinite(numero) || !Number.isInteger(numero) || numero <= 0) {
    return null;
  }

  return numero;
};

const esPrecioValido = (precio) => {
  if (precio === undefined) {
    return true;
  }

  if (precio === null || precio === "") {
    return false;
  }

  const precioNumerico = Number(precio);

  return Number.isFinite(precioNumerico) && precioNumerico >= 0;
};

const normalizarItem = (item) => {
  if (!item || typeof item !== "object" || Array.isArray(item)) {
    return null;
  }

  try {
    const productoId = convertirEnteroPositivo(item.productoId ?? item.id);
    const cantidad = convertirEnteroPositivo(item.cantidad);

    if (!productoId || !cantidad || !esPrecioValido(item.precio)) {
      return null;
    }

    return {
      productoId,
      cantidad,
    };
  } catch (error) {
    avisarEnDesarrollo("Se descartó un item inválido del carrito invitado.", error);
    return null;
  }
};

const normalizarItems = (items) => {
  if (!Array.isArray(items)) {
    return [];
  }

  const itemsPorProducto = new Map();

  items.forEach((item) => {
    const itemNormalizado = normalizarItem(item);

    if (!itemNormalizado) {
      return;
    }

    const cantidadActual = itemsPorProducto.get(itemNormalizado.productoId) || 0;

    itemsPorProducto.set(
      itemNormalizado.productoId,
      cantidadActual + itemNormalizado.cantidad,
    );
  });

  return Array.from(itemsPorProducto.entries()).map(([productoId, cantidad]) => ({
    productoId,
    cantidad,
  }));
};

const escribirCarritoSeguro = (items) => {
  const storage = obtenerLocalStorage();
  const itemsNormalizados = normalizarItems(items);

  if (!storage) {
    return itemsNormalizados;
  }

  try {
    storage.setItem(CLAVE_CARRITO_INVITADO, JSON.stringify(itemsNormalizados));
  } catch (error) {
    avisarEnDesarrollo("No se pudo guardar el carrito invitado.", error);
  }

  return itemsNormalizados;
};

const removerCarritoSeguro = () => {
  const storage = obtenerLocalStorage();

  if (!storage) {
    return;
  }

  try {
    storage.removeItem(CLAVE_CARRITO_INVITADO);
  } catch (error) {
    avisarEnDesarrollo("No se pudo limpiar el carrito invitado.", error);
  }
};

export const obtenerCarritoInvitado = () => {
  const storage = obtenerLocalStorage();

  if (!storage) {
    return [];
  }

  try {
    const carritoGuardado = storage.getItem(CLAVE_CARRITO_INVITADO);

    if (!carritoGuardado) {
      return [];
    }

    const items = JSON.parse(carritoGuardado);

    if (!Array.isArray(items)) {
      removerCarritoSeguro();
      return [];
    }

    const itemsNormalizados = normalizarItems(items);
    const carritoNormalizado = JSON.stringify(itemsNormalizados);

    if (carritoNormalizado !== carritoGuardado) {
      escribirCarritoSeguro(itemsNormalizados);
    }

    return itemsNormalizados;
  } catch (error) {
    avisarEnDesarrollo("El carrito invitado estaba corrupto y fue limpiado.", error);
    removerCarritoSeguro();
    return [];
  }
};

export const guardarCarritoInvitado = (items) => {
  const itemsNormalizados = escribirCarritoSeguro(items);

  notificarCarritoActualizado();

  return itemsNormalizados;
};

export const agregarItemCarritoInvitado = (productoId, cantidad = 1) => {
  const id = convertirEnteroPositivo(productoId);
  const cantidadAgregar = convertirEnteroPositivo(cantidad);

  if (!id) {
    throw new Error("Producto inválido");
  }

  if (!cantidadAgregar) {
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
  const id = convertirEnteroPositivo(productoId);
  const nuevaCantidad = convertirEnteroPositivo(cantidad);

  if (!id) {
    throw new Error("Producto inválido");
  }

  if (!nuevaCantidad) {
    throw new Error("Cantidad inválida");
  }

  const carritoActual = obtenerCarritoInvitado();
  const carritoActualizado = carritoActual.map((item) =>
    item.productoId === id
      ? {
          productoId: id,
          cantidad: nuevaCantidad,
        }
      : item,
  );

  return guardarCarritoInvitado(carritoActualizado);
};

export const eliminarItemCarritoInvitado = (productoId) => {
  const id = convertirEnteroPositivo(productoId);
  const carritoActual = obtenerCarritoInvitado();

  if (!id) {
    return guardarCarritoInvitado(carritoActual);
  }

  const carritoActualizado = carritoActual.filter(
    (item) => item.productoId !== id,
  );

  return guardarCarritoInvitado(carritoActualizado);
};

export const vaciarCarritoInvitado = () => {
  removerCarritoSeguro();
  notificarCarritoActualizado();
};

export const contarItemsCarritoInvitado = () => {
  return obtenerCarritoInvitado().reduce(
    (total, item) => total + item.cantidad,
    0,
  );
};
