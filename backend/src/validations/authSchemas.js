import { z } from "zod";

const emailSchema = z
  .string({
    required_error: "El correo electrónico es obligatorio",
    invalid_type_error: "El correo electrónico debe ser texto",
  })
  .trim()
  .toLowerCase()
  .email("El correo electrónico no es válido");

const passwordSchema = z
  .string({
    required_error: "La contraseña es obligatoria",
    invalid_type_error: "La contraseña debe ser texto",
  })
  .min(8, "La contraseña debe tener al menos 8 caracteres");

const optionalTrimmedString = z.preprocess(
  (value) => {
    if (value === undefined || value === null) {
      return undefined;
    }

    const text = String(value).trim();
    return text === "" ? undefined : text;
  },
  z.string().optional(),
);

const telefonoSchema = z.preprocess(
  (value) => {
    if (value === undefined || value === null) {
      return undefined;
    }

    const text = String(value).trim().replace(/\s+/g, "");
    return text === "" ? undefined : text;
  },
  z
    .string()
    .regex(
      /^(\+?56)?9\d{8}$/,
      "Ingresa un celular chileno válido. Ejemplo: 912345678 o +56912345678",
    )
    .optional(),
);

const booleanFromForm = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") {
    return false;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "on", "yes"].includes(normalized)) return true;
    if (["false", "0", "off", "no"].includes(normalized)) return false;
  }

  return value;
}, z.boolean({ invalid_type_error: "El valor debe ser booleano" }));

export const loginSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
  })
  .passthrough();

export const registroSchema = z
  .object({
    nombre: z
      .string({
        required_error: "El nombre es obligatorio",
        invalid_type_error: "El nombre debe ser texto",
      })
      .trim()
      .min(2, "El nombre debe tener al menos 2 caracteres"),
    email: emailSchema,
    password: passwordSchema,
    telefono: telefonoSchema,
    rut: optionalTrimmedString,
    aceptaTerminos: booleanFromForm.optional(),
    aceptaPromociones: booleanFromForm.optional(),
    aceptaPublicidad: booleanFromForm.optional(),
  })
  .passthrough();
