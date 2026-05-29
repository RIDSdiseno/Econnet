const API_URL = import.meta.env.VITE_API_URL;

export const obtenerProductos = async () => {
  const respuesta = await fetch(`${API_URL}/productos`);

  if (!respuesta.ok) {
    throw new Error("Error al obtener productos");
  }

  const data = await respuesta.json();
  return data.productos;
};

export const obtenerProductoPorId = async (id) => {
  const respuesta = await fetch(`${API_URL}/productos/${id}`);

  if (!respuesta.ok) {
    throw new Error("Error al obtener el producto");
  }

  const data = await respuesta.json();
  return data.producto;
};

export const obtenerCategorias = async () => {
  const respuesta = await fetch(`${API_URL}/categorias`);

  if (!respuesta.ok) {
    throw new Error("Error al obtener categorías");
  }

  const data = await respuesta.json();
  return data.categorias;
};

export const obtenerMarcas = async () => {
  const respuesta = await fetch(`${API_URL}/marcas`);

  if (!respuesta.ok) {
    throw new Error("Error al obtener marcas");
  }

  const data = await respuesta.json();
  return data.marcas;
};
export const obtenerAnuncios = async (ubicacion) => {
  const respuesta = await fetch(`${API_URL}/anuncios?ubicacion=${ubicacion}`);

  if (!respuesta.ok) {
    throw new Error("Error al obtener anuncios");
  }

  const data = await respuesta.json();
  return data.anuncios;
};