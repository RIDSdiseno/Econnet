import { apiRequest } from "./httpClient";

export const obtenerCategorias = async () => {
  const data = await apiRequest("/categorias", {
    errorMessage: "Error al obtener categorías",
  });

  return data.categorias;
};
