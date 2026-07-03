import { apiRequest } from "./httpClient";

export const obtenerMarcas = async () => {
  const data = await apiRequest("/marcas", {
    errorMessage: "Error al obtener marcas",
  });

  return data.marcas;
};

export const obtenerMarcasHome = async () => {
  return apiRequest("/marcas/home", {
    errorMessage: "Error al obtener marcas del home",
  });
};
