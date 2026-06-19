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
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const respuesta = await fetch(`${API_URL}/pedidos`, {
    method: "POST",
    headers,
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


export const calcularDespacho = async (
  token,
  tipoEntrega,
  direccionId = null,
  datosInvitado = {},
) => {
  const params = new URLSearchParams({
    tipoEntrega,
  });

  if (direccionId) {
    params.append("direccionId", direccionId);
  }

  if (datosInvitado.region) {
    params.append("region", datosInvitado.region);
  }

  if (datosInvitado.comuna) {
    params.append("comuna", datosInvitado.comuna);
  }

  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const respuesta = await fetch(
    `${API_URL}/despacho/calcular?${params.toString()}`,
    {
      headers,
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



export const crearPagoWebpay = async (token, pedidoId) => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const respuesta = await fetch(`${API_URL}/pagos/webpay/crear`, {
    method: "POST",
    headers,
    body: JSON.stringify({ pedidoId }),
  });

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || "Error al crear pago con Webpay");
  }

  return data.data;
};


export const crearPagoMercadoPago = async (token, pedidoId) => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const respuesta = await fetch(`${API_URL}/pagos/mercadopago/crear`, {
    method: "POST",
    headers,
    body: JSON.stringify({ pedidoId }),
  });

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || "Error al crear pago con Mercado Pago");
  }

  return data.data;
};



export const suscribirseNewsletter = async (email) => {
  const respuesta = await fetch(`${API_URL}/newsletter/suscribirse`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || "No se pudo registrar la suscripción");
  }

  return data;
};


export const obtenerMediosPago = async (token) => {
  const respuesta = await fetch(`${API_URL}/medios-pago`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || "No se pudieron obtener los medios de pago");
  }

  return data.mediosPago;
};

export const iniciarInscripcionMedioPago = async (token) => {
  const respuesta = await fetch(`${API_URL}/medios-pago/oneclick/iniciar`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || "No se pudo iniciar la inscripción");
  }

  return data.data;
};

export const eliminarMedioPago = async (token, id) => {
  const respuesta = await fetch(`${API_URL}/medios-pago/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || "No se pudo eliminar el medio de pago");
  }

  return data;
};

export const crearPagoOneclick = async (token, pedidoId, medioPagoId) => {
  const respuesta = await fetch(`${API_URL}/pagos/oneclick/crear`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      pedidoId,
      medioPagoId,
    }),
  });

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || "Error al procesar pago con Oneclick");
  }

  return data.data;
};


export const descargarDocumentoPedido = async (token, pedidoId) => {
  const respuesta = await fetch(
    `${API_URL}/documentos/pedidos/${pedidoId}/pdf`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!respuesta.ok) {
    let mensaje = "No se pudo descargar el documento";

    try {
      const data = await respuesta.json();
      mensaje = data.mensaje || mensaje;
    } catch {
      // La respuesta no venía en formato JSON.
    }

    throw new Error(mensaje);
  }

  const blob = await respuesta.blob();

  const contentDisposition =
    respuesta.headers.get("Content-Disposition") || "";

  const coincidencia = contentDisposition.match(
    /filename="?([^"]+)"?/i,
  );

  const nombreArchivo =
    coincidencia?.[1] || `documento-pedido-${pedidoId}.pdf`;

  return {
    blob,
    nombreArchivo,
  };
};

export const descargarDocumentoPedidoInvitado = async (pedidoId, orden) => {
  const params = new URLSearchParams({
    orden,
  });

  const respuesta = await fetch(
    `${API_URL}/pedidos/publico/${pedidoId}/documento?${params.toString()}`,
    {
      method: "GET",
    },
  );

  if (!respuesta.ok) {
    let mensaje = "No se pudo descargar el documento";

    try {
      const data = await respuesta.json();
      mensaje = data.mensaje || mensaje;
    } catch {
      // La respuesta no venía en formato JSON.
    }

    throw new Error(mensaje);
  }

  const blob = await respuesta.blob();

  const contentDisposition =
    respuesta.headers.get("Content-Disposition") || "";

  const coincidencia = contentDisposition.match(
    /filename="?([^"]+)"?/i,
  );

  const nombreArchivo =
    coincidencia?.[1] || `comprobante-pedido-${pedidoId}.pdf`;

  return {
    blob,
    nombreArchivo,
  };
};

export const crearTicketSoporte = async (datos, token = null) => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const respuesta = await fetch(`${API_URL}/soporte`, {
    method: "POST",
    headers,
    body: JSON.stringify(datos),
  });

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      data.mensaje || "No se pudo enviar la solicitud de soporte",
    );
  }

  return data;
};

export const obtenerMisSolicitudes = async (
  token,
  pagina = 1,
  limite = 10,
) => {
  const params = new URLSearchParams({
    pagina: String(pagina),
    limite: String(limite),
  });

  const respuesta = await fetch(
    `${API_URL}/soporte/mis-solicitudes?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      data.mensaje || "No se pudieron obtener tus solicitudes",
    );
  }

  return data;
};

export const obtenerMiSolicitudPorId = async (token, id) => {
  const respuesta = await fetch(
    `${API_URL}/soporte/mis-solicitudes/${id}`,
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

  return data.solicitud;
};

export const responderMiSolicitud = async (
  token,
  id,
  mensajeRespuesta,
) => {
  const respuesta = await fetch(
    `${API_URL}/soporte/mis-solicitudes/${id}/respuestas`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        mensaje: mensajeRespuesta,
      }),
    },
  );

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      data.mensaje || "No se pudo enviar la respuesta",
    );
  }

  return data;
};

export const obtenerSeguimientoPedidoInvitado = async (pedidoId, orden) => {
  const params = new URLSearchParams({
    orden,
  });

  const respuesta = await fetch(
    `${API_URL}/pedidos/publico/${pedidoId}/seguimiento?${params.toString()}`,
  );

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || "No se pudo obtener el seguimiento");
  }

  return data.pedido;
};

export const buscarPedidoInvitado = async (numero, email) => {
  const params = new URLSearchParams({
    numero,
    email,
  });

  const respuesta = await fetch(
    `${API_URL}/pedidos/publico/buscar?${params.toString()}`,
  );

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || "No se pudo buscar el pedido");
  }

  return data.pedido;
};