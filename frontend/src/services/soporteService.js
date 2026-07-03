import { apiRequest } from "./httpClient";

export const crearTicketSoporte = async (datos, token = null) => {
  return apiRequest("/soporte", {
    method: "POST",
    token,
    body: datos,
    errorMessage: "No se pudo enviar la solicitud de soporte",
  });
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

  return apiRequest(`/soporte/mis-solicitudes?${params.toString()}`, {
    token,
    errorMessage: "No se pudieron obtener tus solicitudes",
  });
};

export const obtenerMiSolicitudPorId = async (token, id) => {
  const data = await apiRequest(`/soporte/mis-solicitudes/${id}`, {
    token,
    errorMessage: "No se pudo obtener la solicitud",
  });

  return data.solicitud;
};

export const responderMiSolicitud = async (
  token,
  id,
  mensajeRespuesta,
) => {
  return apiRequest(`/soporte/mis-solicitudes/${id}/respuestas`, {
    method: "POST",
    token,
    body: {
      mensaje: mensajeRespuesta,
    },
    errorMessage: "No se pudo enviar la respuesta",
  });
};
