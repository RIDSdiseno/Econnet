import { z } from "zod";

export const unsubscribeNewsletterSchema = z.object({
  token: z
    .string({
      required_error: "El token de desuscripción es obligatorio",
      invalid_type_error: "El token de desuscripción debe ser texto",
    })
    .trim()
    .length(64, "El enlace de desuscripción no es válido")
    .regex(/^[a-f0-9]{64}$/i, "El enlace de desuscripción no es válido"),
});
