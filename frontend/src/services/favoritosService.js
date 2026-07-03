import { apiRequest } from "./httpClient";

export const obtenerFavoritos = async (token) => {
  const data = await apiRequest("/favoritos", {
    token,
    errorMessage: "Error al obtener favoritos",
  });

  return data.favoritos;
};

export const agregarFavorito = async (token, productoId) => {
  const data = await apiRequest(`/favoritos/${productoId}`, {
    method: "POST",
    token,
    errorMessage: "Error al agregar favorito",
  });

  return data.favorito;
};

export const eliminarFavoritoUsuario = async (token, productoId) => {
  return apiRequest(`/favoritos/${productoId}`, {
    method: "DELETE",
    token,
    errorMessage: "Error al eliminar favorito",
  });
};
