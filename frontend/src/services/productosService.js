import { apiRequest } from "./httpClient";
import { normalizarProductoId } from "../utils/productoId";

const crearQueryProductos = (parametros = {}) => {
  const params = new URLSearchParams();

  if (parametros.page) params.set("page", String(parametros.page));
  if (parametros.limit) params.set("limit", String(parametros.limit));
  if (parametros.categoria) params.set("categoria", parametros.categoria);
  if (parametros.marca) params.set("marca", parametros.marca);
  if (parametros.orden) params.set("orden", parametros.orden);
  if (parametros.buscar) params.set("buscar", parametros.buscar);

  const query = params.toString();

  return query ? `?${query}` : "";
};

const normalizarRespuestaProductos = (data) => {
  if (Array.isArray(data)) {
    return {
      productos: data,
      total: data.length,
      pagina: 1,
      limite: data.length,
      totalPaginas: data.length > 0 ? 1 : 0,
    };
  }

  return {
    productos: data?.productos || [],
    total: data?.total ?? data?.productos?.length ?? 0,
    pagina: data?.pagina ?? 1,
    limite: data?.limite ?? data?.productos?.length ?? 0,
    totalPaginas: data?.totalPaginas ?? 0,
  };
};

export const obtenerProductosPaginados = async (parametros = {}) => {
  const data = await apiRequest(`/productos${crearQueryProductos(parametros)}`, {
    errorMessage: "Error al obtener productos",
  });

  return normalizarRespuestaProductos(data);
};

export const obtenerProductos = async (parametros = {}) => {
  const data = await obtenerProductosPaginados(parametros);

  return data.productos;
};

export const obtenerProductoPorId = async (id) => {
  const productoId = normalizarProductoId(id);

  if (!productoId) {
    const error = new Error("El ID del producto no es válido");
    error.status = 400;
    throw error;
  }

  const data = await apiRequest(`/productos/${productoId}`, {
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
