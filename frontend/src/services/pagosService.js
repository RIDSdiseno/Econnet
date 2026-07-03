import { apiRequest } from "./httpClient";

export const crearPagoWebpay = async (token, pedidoId) => {
  const data = await apiRequest("/pagos/webpay/crear", {
    method: "POST",
    token,
    body: { pedidoId },
    errorMessage: "Error al crear pago con Webpay",
  });

  return data.data;
};

export const crearPagoMercadoPago = async (token, pedidoId) => {
  const data = await apiRequest("/pagos/mercadopago/crear", {
    method: "POST",
    token,
    body: { pedidoId },
    errorMessage: "Error al crear pago con Mercado Pago",
  });

  return data.data;
};

export const obtenerMediosPago = async (token) => {
  const data = await apiRequest("/medios-pago", {
    token,
    errorMessage: "No se pudieron obtener los medios de pago",
  });

  return data.mediosPago;
};

export const iniciarInscripcionMedioPago = async (token) => {
  const data = await apiRequest("/medios-pago/oneclick/iniciar", {
    method: "POST",
    token,
    headers: {
      "Content-Type": "application/json",
    },
    errorMessage: "No se pudo iniciar la inscripción",
  });

  return data.data;
};

export const eliminarMedioPago = async (token, id) => {
  return apiRequest(`/medios-pago/${id}`, {
    method: "DELETE",
    token,
    errorMessage: "No se pudo eliminar el medio de pago",
  });
};

export const crearPagoOneclick = async (token, pedidoId, medioPagoId) => {
  const data = await apiRequest("/pagos/oneclick/crear", {
    method: "POST",
    token,
    body: {
      pedidoId,
      medioPagoId,
    },
    errorMessage: "Error al procesar pago con Oneclick",
  });

  return data.data;
};
