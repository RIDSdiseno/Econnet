import { apiFetch, apiRequest } from "./httpClient";

const obtenerNombreArchivoDesdeHeaders = (response, nombrePorDefecto) => {
  const contentDisposition = response.headers.get("Content-Disposition") || "";
  const coincidencia = contentDisposition.match(/filename="?([^"]+)"?/i);

  return coincidencia?.[1] || nombrePorDefecto;
};

const descargarBlob = async (path, options, mensajeError, nombrePorDefecto) => {
  const respuesta = await apiFetch(path, options);

  if (!respuesta.ok) {
    let mensaje = mensajeError;

    try {
      const data = await respuesta.json();
      mensaje = data.mensaje || mensaje;
    } catch {
      // La respuesta no venía en formato JSON.
    }

    throw new Error(mensaje);
  }

  const blob = await respuesta.blob();

  return {
    blob,
    nombreArchivo: obtenerNombreArchivoDesdeHeaders(respuesta, nombrePorDefecto),
  };
};

export const crearPedido = async (token, datos) => {
  const data = await apiRequest("/pedidos", {
    method: "POST",
    token,
    body: datos,
    errorMessage: "Error al crear pedido",
  });

  return data.pedido;
};

export const obtenerPedidos = async (token) => {
  const data = await apiRequest("/pedidos", {
    token,
    errorMessage: "Error al obtener pedidos",
  });

  return data.pedidos;
};

export const obtenerPedidoPorId = async (token, id) => {
  const data = await apiRequest(`/pedidos/${id}`, {
    token,
    errorMessage: "Error al obtener pedido",
  });

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

  const data = await apiRequest(`/despacho/calcular?${params.toString()}`, {
    token,
    errorMessage: "Error al calcular despacho",
  });

  return data.despacho;
};

export const descargarDocumentoPedido = async (token, pedidoId) => {
  return descargarBlob(
    `/documentos/pedidos/${pedidoId}/pdf`,
    {
      method: "GET",
      token,
    },
    "No se pudo descargar el documento",
    `documento-pedido-${pedidoId}.pdf`,
  );
};

export const descargarDocumentoPedidoInvitado = async (pedidoId, orden) => {
  const params = new URLSearchParams({
    orden,
  });

  return descargarBlob(
    `/pedidos/publico/${pedidoId}/documento?${params.toString()}`,
    {
      method: "GET",
    },
    "No se pudo descargar el documento",
    `comprobante-pedido-${pedidoId}.pdf`,
  );
};

export const obtenerSeguimientoPedidoInvitado = async (pedidoId, orden) => {
  const params = new URLSearchParams({
    orden,
  });

  const data = await apiRequest(
    `/pedidos/publico/${pedidoId}/seguimiento?${params.toString()}`,
    {
      errorMessage: "No se pudo obtener el seguimiento",
    },
  );

  return data.pedido;
};

export const buscarPedidoInvitado = async (numero, email) => {
  const params = new URLSearchParams({
    numero,
    email,
  });

  const data = await apiRequest(`/pedidos/publico/buscar?${params.toString()}`, {
    errorMessage: "No se pudo buscar el pedido",
  });

  return data.pedido;
};
