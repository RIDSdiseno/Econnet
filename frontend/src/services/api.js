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
export const obtenerAnuncios = async (ubicacion = "") => {
  const query = ubicacion ? `?ubicacion=${encodeURIComponent(ubicacion)}` : "";

  const res = await fetch(`${API_URL}/anuncios${query}`);

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.mensaje || "Error al obtener anuncios");
  }

  return data.anuncios || [];
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

export const obtenerCarrito = async (token) => {
  const respuesta = await fetch(`${API_URL}/carrito`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || "Error al obtener carrito");
  }

  return data;
};

export const agregarProductoCarrito = async (token, productoId) => {
  const respuesta = await fetch(`${API_URL}/carrito/${productoId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || "Error al agregar producto al carrito");
  }

  return data.item;
};

export const actualizarCantidadCarrito = async (token, productoId, cantidad) => {
  const respuesta = await fetch(`${API_URL}/carrito/${productoId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ cantidad }),
  });

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || "Error al actualizar cantidad");
  }

  return data.item;
};

export const eliminarProductoCarrito = async (token, productoId) => {
  const respuesta = await fetch(`${API_URL}/carrito/${productoId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || "Error al eliminar producto del carrito");
  }

  return data;
};

export const vaciarCarritoUsuario = async (token) => {
  const respuesta = await fetch(`${API_URL}/carrito`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || "Error al vaciar carrito");
  }

  return data;
};


export const crearPedido = async (token, datos) => {
  const respuesta = await fetch(`${API_URL}/pedidos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(datos),
  });

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || "Error al crear pedido");
  }

  return data.pedido;
};

export const obtenerPedidos = async (token) => {
  const respuesta = await fetch(`${API_URL}/pedidos`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || "Error al obtener pedidos");
  }

  return data.pedidos;
};

export const obtenerPedidoPorId = async (token, id) => {
  const respuesta = await fetch(`${API_URL}/pedidos/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || "Error al obtener pedido");
  }

  return data.pedido;
};


export const calcularDespacho = async (token, tipoEntrega, direccionId) => {
  const params = new URLSearchParams({
    tipoEntrega,
  });

  if (direccionId) {
    params.append("direccionId", direccionId);
  }

  const respuesta = await fetch(
    `${API_URL}/despacho/calcular?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || "Error al calcular despacho");
  }

  return data.despacho;
};

export const obtenerMarcasHome = async () => {
  const res = await fetch(`${API_URL}/marcas/home`);

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.mensaje || "Error al obtener marcas del home");
  }

  return data;
};


export const obtenerProductosDestacados = async () => {
  const res = await fetch(`${API_URL}/productos/destacados`);

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.mensaje || "Error al obtener productos destacados");
  }

  return data.productos || [];
};

