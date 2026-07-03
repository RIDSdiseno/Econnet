import { apiRequest } from "./httpClient";

export const obtenerProductos = async () => {
  const data = await apiRequest("/productos", {
    errorMessage: "Error al obtener productos",
  });

  return data.productos;
};

export const obtenerProductoPorId = async (id) => {
  const data = await apiRequest(`/productos/${id}`, {
    errorMessage: "Error al obtener el producto",
  });

  return data.producto;
};

export const obtenerProductosDestacados = async () => {
  const data = await apiRequest("/productos/destacados", {
    errorMessage: "Error al obtener productos destacados",
  });

  return data.productos || [];
};

export const obtenerAnuncios = async (ubicacion = "") => {
  const query = ubicacion ? `?ubicacion=${encodeURIComponent(ubicacion)}` : "";

  const data = await apiRequest(`/anuncios${query}`, {
    errorMessage: "Error al obtener anuncios",
  });

  return data.anuncios || [];
};
