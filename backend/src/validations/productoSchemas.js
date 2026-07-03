import { z } from "zod";

const emptyToUndefined = (value) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }

  return value;
};

const emptyToNull = (value) => {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value === "string" && value.trim() === "") {
    return null;
  }

  return value;
};

const trimmedString = (fieldName, min = 1) =>
  z
    .string({
      required_error: `${fieldName} es obligatorio`,
      invalid_type_error: `${fieldName} debe ser texto`,
    })
    .trim()
    .min(min, `${fieldName} debe tener al menos ${min} caracteres`);

const optionalTrimmedString = z.preprocess(
  (value) => {
    if (value === undefined || value === null) {
      return undefined;
    }

    const text = String(value).trim();
    return text === "" ? null : text;
  },
  z.string().nullable().optional(),
);

const optionalPositiveId = z.preprocess(
  emptyToNull,
  z.coerce
    .number({
      invalid_type_error: "El identificador debe ser numérico",
    })
    .int("El identificador debe ser un número entero")
    .positive("El identificador debe ser positivo")
    .nullable()
    .optional(),
);

const requiredPositiveId = (fieldName) =>
  z.coerce
    .number({
      required_error: `${fieldName} es obligatorio`,
      invalid_type_error: `${fieldName} debe ser numérico`,
    })
    .int(`${fieldName} debe ser un número entero`)
    .positive(`${fieldName} debe ser positivo`);

const requiredPrice = z.coerce
  .number({
    required_error: "El precio es obligatorio",
    invalid_type_error: "El precio debe ser numérico",
  })
  .positive("El precio debe ser mayor a 0");

const optionalPrice = z.preprocess(
  emptyToUndefined,
  z.coerce
    .number({
      invalid_type_error: "El precio debe ser numérico",
    })
    .positive("El precio debe ser mayor a 0")
    .optional(),
);

const requiredStock = z.coerce
  .number({
    required_error: "El stock es obligatorio",
    invalid_type_error: "El stock debe ser numérico",
  })
  .int("El stock debe ser un número entero")
  .min(0, "El stock debe ser mayor o igual a 0");

const optionalStock = z.preprocess(
  emptyToUndefined,
  z.coerce
    .number({
      invalid_type_error: "El stock debe ser numérico",
    })
    .int("El stock debe ser un número entero")
    .min(0, "El stock debe ser mayor o igual a 0")
    .optional(),
);

const optionalPrecioNormal = z.preprocess(
  emptyToNull,
  z.coerce
    .number({
      invalid_type_error: "El precio normal debe ser numérico",
    })
    .min(0, "El precio normal debe ser mayor o igual a 0")
    .nullable()
    .optional(),
);

const optionalDiscount = z.preprocess(
  emptyToUndefined,
  z.coerce
    .number({
      invalid_type_error: "El descuento debe ser numérico",
    })
    .min(0, "El descuento debe estar entre 0 y 100")
    .max(100, "El descuento debe estar entre 0 y 100")
    .optional(),
);

const optionalInteger = (fieldName) =>
  z.preprocess(
    emptyToUndefined,
    z.coerce
      .number({
        invalid_type_error: `${fieldName} debe ser numérico`,
      })
      .int(`${fieldName} debe ser un número entero`)
      .optional(),
  );

const booleanFromForm = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
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
}, z.boolean({ invalid_type_error: "El valor debe ser booleano" }).optional());

const formatoOfertaSchema = z.preprocess(
  (value) => {
    if (value === undefined || value === null) {
      return undefined;
    }

    const text = String(value).trim();
    return text === "" ? undefined : text;
  },
  z.enum(["small", "large"], {
    invalid_type_error: "El formato de oferta no es válido",
  }).optional(),
);

const baseProductoSchema = {
  nombre: trimmedString("El nombre", 2),
  slug: trimmedString("El slug", 2),
  descripcion: optionalTrimmedString,
  precio: requiredPrice,
  stock: requiredStock,
  sku: optionalTrimmedString,
  modelo: optionalTrimmedString,
  garantia: optionalTrimmedString,
  categoriaId: requiredPositiveId("La categoría"),
  marcaId: optionalPositiveId,
  activo: booleanFromForm,
  destacado: booleanFromForm,
  enOferta: booleanFromForm,
  precioNormal: optionalPrecioNormal,
  descuento: optionalDiscount,
  etiquetaOferta: optionalTrimmedString,
  etiquetaEnvio: optionalTrimmedString,
  etiquetaDisponibilidad: optionalTrimmedString,
  mostrarEnOfertas: booleanFromForm,
  formatoOferta: formatoOfertaSchema,
  ordenOferta: optionalInteger("El orden de oferta"),
};

const crearOfertaRefinement = (data, ctx) => {
  if (data.enOferta === true) {
    if (data.precioNormal === undefined || data.precioNormal === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["precioNormal"],
        message: "El precio normal es obligatorio cuando el producto está en oferta",
      });
      return;
    }

    if (data.precio !== undefined && data.precioNormal <= data.precio) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["precioNormal"],
        message: "El precio normal debe ser mayor que el precio en oferta",
      });
    }
  }
};

const actualizarOfertaRefinement = (data, ctx) => {
  if (data.enOferta === true && data.precioNormal === null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["precioNormal"],
      message: "El precio normal es obligatorio cuando el producto está en oferta",
    });
    return;
  }

  if (
    data.enOferta === true &&
    data.precio !== undefined &&
    data.precioNormal !== undefined &&
    data.precioNormal !== null &&
    data.precioNormal <= data.precio
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["precioNormal"],
      message: "El precio normal debe ser mayor que el precio en oferta",
    });
  }
};

export const crearProductoSchema = z
  .object(baseProductoSchema)
  .passthrough()
  .superRefine(crearOfertaRefinement);

const camposActualizacion = Object.fromEntries(
  Object.entries(baseProductoSchema).map(([key, schema]) => [
    key,
    schema.optional(),
  ]),
);

export const actualizarProductoSchema = z
  .object(camposActualizacion)
  .passthrough()
  .superRefine((data, ctx) => {
    const camposModificables = Object.keys(camposActualizacion);
    const tieneCampo = camposModificables.some((field) =>
      Object.prototype.hasOwnProperty.call(data, field),
    );

    if (!tieneCampo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [],
        message: "Debes enviar al menos un campo para actualizar",
      });
    }

    actualizarOfertaRefinement(data, ctx);
  });
