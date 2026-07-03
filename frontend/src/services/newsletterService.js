import { apiRequest } from "./httpClient";

export const suscribirseNewsletter = async (email) => {
  return apiRequest("/newsletter/suscribirse", {
    method: "POST",
    body: { email },
    errorMessage: "No se pudo registrar la suscripción",
  });
};
