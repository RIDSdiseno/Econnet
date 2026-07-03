import { apiRequest } from "./httpClient";

export const obtenerCarrito = async (token) => {
  return apiRequest("/carrito", {
    token,
    errorMessage: "Error al obtener carrito",
  });
};

export const agregarProductoCarrito = async (token, productoId) => {
  const data = await apiRequest(`/carrito/${productoId}`, {
    method: "POST",
    token,
    errorMessage: "Error al agregar producto al carrito",
  });

  return data.item;
};

export const actualizarCantidadCarrito = async (token, productoId, cantidad) => {
  const data = await apiRequest(`/carrito/${productoId}`, {
    method: "PUT",
    token,
    body: { cantidad },
    errorMessage: "Error al actualizar cantidad",
  });

  return data.item;
};

export const eliminarProductoCarrito = async (token, productoId) => {
  return apiRequest(`/carrito/${productoId}`, {
    method: "DELETE",
    token,
    errorMessage: "Error al eliminar producto del carrito",
  });
};

export const vaciarCarritoUsuario = async (token) => {
  return apiRequest("/carrito", {
    method: "DELETE",
    token,
    errorMessage: "Error al vaciar carrito",
  });
};
