const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const obtenerHeaders = (token) => {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const obtenerPedidosAdmin = async (token) => {
  const res = await fetch(`${API_URL}/admin/pedidos`, {
    method: "GET",
    headers: obtenerHeaders(token),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.mensaje || "Error al obtener pedidos");
  }

  return data;
};

export const obtenerPedidoAdminPorId = async (token, id) => {
  const res = await fetch(`${API_URL}/admin/pedidos/${id}`, {
    method: "GET",
    headers: obtenerHeaders(token),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.mensaje || "Error al obtener el pedido");
  }

  return data;
};

export const actualizarEstadoPedidoAdmin = async (token, id, estado) => {
  const res = await fetch(`${API_URL}/admin/pedidos/${id}/estado`, {
    method: "PUT",
    headers: obtenerHeaders(token),
    body: JSON.stringify({ estado }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.mensaje || "Error al actualizar estado");
  }

  return data;
};

export const obtenerTarifasAdmin = async (token) => {
  const res = await fetch(`${API_URL}/admin/tarifas`, {
    method: "GET",
    headers: obtenerHeaders(token),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.mensaje || "Error al obtener tarifas");
  }

  return data;
};

export const actualizarTarifaAdmin = async (token, id, tarifa) => {
  const res = await fetch(`${API_URL}/admin/tarifas/${id}`, {
    method: "PUT",
    headers: obtenerHeaders(token),
    body: JSON.stringify(tarifa),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.mensaje || "Error al actualizar tarifa");
  }

  return data;
};

export const obtenerCategoriasAdmin = async (token) => {
  const res = await fetch(`${API_URL}/admin/categorias`, {
    method: "GET",
    headers: obtenerHeaders(token),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.mensaje || "Error al obtener categorías");
  }

  return data;
};

export const crearCategoriaAdmin = async (token, categoria) => {
  const res = await fetch(`${API_URL}/admin/categorias`, {
    method: "POST",
    headers: obtenerHeaders(token),
    body: JSON.stringify(categoria),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.mensaje || "Error al crear categoría");
  }

  return data;
};

export const actualizarCategoriaAdmin = async (token, id, categoria) => {
  const res = await fetch(`${API_URL}/admin/categorias/${id}`, {
    method: "PUT",
    headers: obtenerHeaders(token),
    body: JSON.stringify(categoria),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.mensaje || "Error al actualizar categoría");
  }

  return data;
};

export const obtenerMarcasAdmin = async (token) => {
  const res = await fetch(`${API_URL}/admin/marcas`, {
    method: "GET",
    headers: obtenerHeaders(token),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.mensaje || "Error al obtener marcas");
  }

  return data;
};

export const crearMarcaAdmin = async (token, marca) => {
  const res = await fetch(`${API_URL}/admin/marcas`, {
    method: "POST",
    headers: obtenerHeaders(token),
    body: JSON.stringify(marca),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.mensaje || "Error al crear marca");
  }

  return data;
};

export const actualizarMarcaAdmin = async (token, id, marca) => {
  const res = await fetch(`${API_URL}/admin/marcas/${id}`, {
    method: "PUT",
    headers: obtenerHeaders(token),
    body: JSON.stringify(marca),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.mensaje || "Error al actualizar marca");
  }

  return data;
};


export const subirLogoMarcaAdmin = async (token, archivo) => {
  const formData = new FormData();
  formData.append("imagen", archivo);

  const res = await fetch(`${API_URL}/upload/marca`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.mensaje || "Error al subir logo de marca");
  }

  return data;
};


export const obtenerProductosAdmin = async (token) => {
  const res = await fetch(`${API_URL}/admin/productos`, {
    method: "GET",
    headers: obtenerHeaders(token),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.mensaje || "Error al obtener productos");
  }

  return data;
};

export const crearProductoAdmin = async (token, producto) => {
  const res = await fetch(`${API_URL}/admin/productos`, {
    method: "POST",
    headers: obtenerHeaders(token),
    body: JSON.stringify(producto),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.mensaje || "Error al crear producto");
  }

  return data;
};

export const actualizarProductoAdmin = async (token, id, producto) => {
  const res = await fetch(`${API_URL}/admin/productos/${id}`, {
    method: "PUT",
    headers: obtenerHeaders(token),
    body: JSON.stringify(producto),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.mensaje || "Error al actualizar producto");
  }

  return data;
};


export const subirImagenProductoAdmin = async (token, archivo) => {
  const formData = new FormData();
  formData.append("imagen", archivo);

  const res = await fetch(`${API_URL}/upload/producto`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.mensaje || "Error al subir imagen del producto");
  }

  return data;
};

export const agregarImagenProductoAdmin = async (token, productoId, imagen) => {
  const res = await fetch(`${API_URL}/admin/productos/${productoId}/imagenes`, {
    method: "POST",
    headers: obtenerHeaders(token),
    body: JSON.stringify(imagen),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.mensaje || "Error al guardar imagen del producto");
  }

  return data;
};

export const marcarImagenPrincipalProductoAdmin = async (token, imagenId) => {
  const res = await fetch(
    `${API_URL}/admin/productos/imagenes/${imagenId}/principal`,
    {
      method: "PUT",
      headers: obtenerHeaders(token),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.mensaje || "Error al marcar imagen como principal");
  }

  return data;
};

export const eliminarImagenProductoAdmin = async (token, imagenId) => {
  const res = await fetch(`${API_URL}/admin/productos/imagenes/${imagenId}`, {
    method: "DELETE",
    headers: obtenerHeaders(token),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.mensaje || "Error al eliminar imagen");
  }

  return data;
};


export const agregarEspecificacionProductoAdmin = async (
  token,
  productoId,
  especificacion
) => {
  const res = await fetch(
    `${API_URL}/admin/productos/${productoId}/especificaciones`,
    {
      method: "POST",
      headers: obtenerHeaders(token),
      body: JSON.stringify(especificacion),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.mensaje || "Error al agregar especificación");
  }

  return data;
};

export const actualizarEspecificacionProductoAdmin = async (
  token,
  especificacionId,
  especificacion
) => {
  const res = await fetch(
    `${API_URL}/admin/productos/especificaciones/${especificacionId}`,
    {
      method: "PUT",
      headers: obtenerHeaders(token),
      body: JSON.stringify(especificacion),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.mensaje || "Error al actualizar especificación");
  }

  return data;
};

export const eliminarEspecificacionProductoAdmin = async (
  token,
  especificacionId
) => {
  const res = await fetch(
    `${API_URL}/admin/productos/especificaciones/${especificacionId}`,
    {
      method: "DELETE",
      headers: obtenerHeaders(token),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.mensaje || "Error al eliminar especificación");
  }

  return data;
};


export const guardarEspecificacionesProductoAdmin = async (
  token,
  productoId,
  especificaciones
) => {
  const res = await fetch(
    `${API_URL}/admin/productos/${productoId}/especificaciones`,
    {
      method: "PUT",
      headers: obtenerHeaders(token),
      body: JSON.stringify({ especificaciones }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.mensaje || "Error al guardar especificaciones");
  }

  return data;
};


export const obtenerAnunciosAdmin = async (token) => {
  const res = await fetch(`${API_URL}/admin/anuncios`, {
    method: "GET",
    headers: obtenerHeaders(token),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.mensaje || "Error al obtener anuncios");
  }

  return data;
};

export const crearAnuncioAdmin = async (token, anuncio) => {
  const res = await fetch(`${API_URL}/admin/anuncios`, {
    method: "POST",
    headers: obtenerHeaders(token),
    body: JSON.stringify(anuncio),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.mensaje || "Error al crear anuncio");
  }

  return data;
};

export const actualizarAnuncioAdmin = async (token, id, anuncio) => {
  const res = await fetch(`${API_URL}/admin/anuncios/${id}`, {
    method: "PUT",
    headers: obtenerHeaders(token),
    body: JSON.stringify(anuncio),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.mensaje || "Error al actualizar anuncio");
  }

  return data;
};

export const desactivarAnuncioAdmin = async (token, id) => {
  const res = await fetch(`${API_URL}/admin/anuncios/${id}`, {
    method: "DELETE",
    headers: obtenerHeaders(token),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.mensaje || "Error al desactivar anuncio");
  }

  return data;
};

export const reactivarAnuncioAdmin = async (token, id) => {
  const res = await fetch(`${API_URL}/admin/anuncios/${id}/reactivar`, {
    method: "PATCH",
    headers: obtenerHeaders(token),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.mensaje || "Error al reactivar anuncio");
  }

  return data;
};

export const subirImagenAnuncioAdmin = async (token, archivo) => {
  const formData = new FormData();
  formData.append("imagen", archivo);

  const res = await fetch(`${API_URL}/upload/anuncio`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.mensaje || "Error al subir imagen del anuncio");
  }

  return data;
};


export const subirImagenCategoriaAdmin = async (token, archivo) => {
  const formData = new FormData();
  formData.append("imagen", archivo);

  const res = await fetch(`${API_URL}/upload/categoria`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.mensaje || "Error al subir imagen de categoría");
  }

  return data;
};


export const obtenerDashboardAdmin = async (token) => {
  const res = await fetch(`${API_URL}/admin/dashboard`, {
    headers: obtenerHeaders(token),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.mensaje || "Error al obtener dashboard");
  }

  return data;
};


export const obtenerUsuariosAdmin = async (token) => {
  const res = await fetch(`${API_URL}/admin/usuarios`, {
    headers: obtenerHeaders(token),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.mensaje || "Error al obtener usuarios");
  }

  return data;
};

export const actualizarUsuarioAdmin = async (token, usuarioId, payload) => {
  const res = await fetch(`${API_URL}/admin/usuarios/${usuarioId}`, {
    method: "PUT",
    headers: obtenerHeaders(token),
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.mensaje || "Error al actualizar usuario");
  }

  return data;
};


export const obtenerTicketsSoporteAdmin = async (
  token,
  filtros = {},
) => {
  const params = new URLSearchParams();

  if (filtros.estado) {
    params.append("estado", filtros.estado);
  }

  if (filtros.categoria) {
    params.append("categoria", filtros.categoria);
  }

  if (filtros.busqueda) {
    params.append("busqueda", filtros.busqueda);
  }

  params.append("pagina", String(filtros.pagina || 1));
  params.append("limite", String(filtros.limite || 10));

  const respuesta = await fetch(
    `${API_URL}/admin/soporte?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      data.mensaje ||
        "No se pudieron obtener las solicitudes de soporte",
    );
  }

  return data;
};

export const obtenerTicketSoporteAdminPorId = async (
  token,
  id,
) => {
  const respuesta = await fetch(
    `${API_URL}/admin/soporte/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      data.mensaje || "No se pudo obtener la solicitud",
    );
  }

  return data;
};

export const responderTicketSoporteAdmin = async (
  token,
  id,
  mensaje,
) => {
  const respuesta = await fetch(
    `${API_URL}/admin/soporte/${id}/respuestas`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        mensaje,
      }),
    },
  );

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      data.mensaje || "No se pudo registrar la respuesta",
    );
  }

  return data;
};

export const actualizarEstadoTicketSoporteAdmin = async (
  token,
  id,
  estado,
) => {
  const respuesta = await fetch(
    `${API_URL}/admin/soporte/${id}/estado`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        estado,
      }),
    },
  );

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      data.mensaje || "No se pudo actualizar el estado",
    );
  }

  return data;
};


function construirParametrosProductosVendidos(filtros = {}) {
  const params = new URLSearchParams();

  if (filtros.busqueda?.trim()) {
    params.append("busqueda", filtros.busqueda.trim());
  }

  if (filtros.estadoPedido) {
    params.append("estadoPedido", filtros.estadoPedido);
  }

  if (filtros.estadoPago) {
    params.append("estadoPago", filtros.estadoPago);
  }

  if (filtros.categoriaId) {
    params.append("categoriaId", String(filtros.categoriaId));
  }

  if (filtros.marcaId) {
    params.append("marcaId", String(filtros.marcaId));
  }

  if (filtros.fechaDesde) {
    params.append("fechaDesde", filtros.fechaDesde);
  }

  if (filtros.fechaHasta) {
    params.append("fechaHasta", filtros.fechaHasta);
  }

  params.append("pagina", String(filtros.pagina || 1));
  params.append("limite", String(filtros.limite || 10));

  return params;
}

export const obtenerProductosVendidosAdmin = async (
  token,
  filtros = {},
) => {
  const params = construirParametrosProductosVendidos(filtros);

  const respuesta = await fetch(
    `${API_URL}/admin/productos-vendidos?${params.toString()}`,
    {
      headers: obtenerHeaders(token),
    },
  );

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      data.mensaje ||
        "No se pudieron obtener los productos vendidos",
    );
  }

  return data;
};

export const obtenerResumenProductosVendidosAdmin = async (
  token,
  filtros = {},
) => {
  const params = construirParametrosProductosVendidos(filtros);

  if (filtros.ordenarPor) {
    params.append("ordenarPor", filtros.ordenarPor);
  }

  const respuesta = await fetch(
    `${API_URL}/admin/productos-vendidos/resumen?${params.toString()}`,
    {
      headers: obtenerHeaders(token),
    },
  );

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      data.mensaje ||
        "No se pudo obtener el resumen de productos vendidos",
    );
  }

  return data;
};

export const obtenerFiltrosProductosVendidosAdmin = async (
  token,
) => {
  const respuesta = await fetch(
    `${API_URL}/admin/productos-vendidos/filtros`,
    {
      headers: obtenerHeaders(token),
    },
  );

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      data.mensaje ||
        "No se pudieron obtener las opciones de los filtros",
    );
  }

  return data;
};