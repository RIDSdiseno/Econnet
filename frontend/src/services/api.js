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

export const registrarUsuario = async (datos) => {
  const respuesta = await fetch(`${API_URL}/auth/registro`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datos),
  });

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || "Error al registrar usuario");
  }

  return data;
};

export const loginUsuario = async (datos) => {
  const respuesta = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datos),
  });

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || "Error al iniciar sesión");
  }

  return data;
};

export const obtenerPerfil = async (token) => {
  const respuesta = await fetch(`${API_URL}/auth/perfil`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || "Error al obtener perfil");
  }

  return data;
};

export const obtenerDirecciones = async (token) => {
  const respuesta = await fetch(`${API_URL}/direcciones`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || "Error al obtener direcciones");
  }

  return data.direcciones;
};

export const crearDireccion = async (token, datos) => {
  const respuesta = await fetch(`${API_URL}/direcciones`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(datos),
  });

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || "Error al crear dirección");
  }

  return data.direccion;
};

export const marcarDireccionPrincipal = async (token, id) => {
  const respuesta = await fetch(`${API_URL}/direcciones/${id}/principal`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || "Error al marcar dirección principal");
  }

  return data.direccion;
};

export const eliminarDireccionUsuario = async (token, id) => {
  const respuesta = await fetch(`${API_URL}/direcciones/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || "Error al eliminar dirección");
  }

  return data;
};

export const obtenerFavoritos = async (token) => {
  const respuesta = await fetch(`${API_URL}/favoritos`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || "Error al obtener favoritos");
  }

  return data.favoritos;
};

export const agregarFavorito = async (token, productoId) => {
  const respuesta = await fetch(`${API_URL}/favoritos/${productoId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || "Error al agregar favorito");
  }

  return data.favorito;
};

export const eliminarFavoritoUsuario = async (token, productoId) => {
  const respuesta = await fetch(`${API_URL}/favoritos/${productoId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || "Error al eliminar favorito");
  }

  return data;
};

export const actualizarPerfil = async (token, datos) => {
  const respuesta = await fetch(`${API_URL}/auth/perfil`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(datos),
  });

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || "Error al actualizar perfil");
  }

  return data.usuario;
};

export const cambiarPasswordUsuario = async (token, datos) => {
  const respuesta = await fetch(`${API_URL}/auth/password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(datos),
  });

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || "Error al cambiar contraseña");
  }

  return data;
};