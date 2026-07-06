import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import multer from "multer";
import logger from "../config/logger.js";
import { AppError } from "../utils/AppError.js";

const isProduction = process.env.NODE_ENV === "production";

function formatZodIssues(issues = []) {
  return issues.map((issue) => ({
    campo: issue.path?.length > 0 ? issue.path.join(".") : "root",
    mensaje: issue.message,
  }));
}

function normalizePrismaTarget(target) {
  if (Array.isArray(target)) {
    return target;
  }

  if (typeof target === "string") {
    return [target];
  }

  return [];
}

function getUniqueConstraintMessage(error) {
  const target = normalizePrismaTarget(error.meta?.target);
  const fields = target.map((field) => String(field).toLowerCase());

  if (fields.some((field) => field.includes("email") || field.includes("correo"))) {
    return "El correo ya está registrado";
  }

  if (fields.some((field) => field.includes("rut"))) {
    return "El RUT ya está registrado";
  }

  if (fields.some((field) => field.includes("sku"))) {
    return "El SKU ya está registrado";
  }

  return "Ya existe un registro con estos datos";
}

function buildErrorResponse(error) {
  if (error instanceof AppError || error.isOperational) {
    return {
      statusCode: error.statusCode || 500,
      body: {
        ok: false,
        mensaje: error.message,
        ...(error.details ? { errores: error.details } : {}),
      },
      logLevel: error.statusCode >= 500 ? "error" : "warn",
    };
  }

  if (error instanceof ZodError) {
    return {
      statusCode: 400,
      body: {
        ok: false,
        mensaje: "Datos inválidos",
        errores: formatZodIssues(error.issues),
      },
      logLevel: "warn",
    };
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return {
        statusCode: 409,
        body: {
          ok: false,
          mensaje: getUniqueConstraintMessage(error),
        },
        logLevel: "warn",
      };
    }

    if (error.code === "P2025") {
      return {
        statusCode: 404,
        body: {
          ok: false,
          mensaje: "El registro solicitado no existe",
        },
        logLevel: "warn",
      };
    }

    return {
      statusCode: 500,
      body: {
        ok: false,
        mensaje: "Ocurrió un error interno en el servidor",
      },
      logLevel: "error",
    };
  }

  if (error instanceof multer.MulterError) {
    const mensaje =
      error.code === "LIMIT_FILE_SIZE"
        ? "El archivo supera el tamaño máximo permitido"
        : error.code === "LIMIT_UNEXPECTED_FILE"
          ? "El archivo enviado no corresponde al campo esperado"
          : "No se pudo procesar el archivo enviado";

    return {
      statusCode: 400,
      body: {
        ok: false,
        mensaje,
      },
      logLevel: "warn",
    };
  }

  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return {
      statusCode: 400,
      body: {
        ok: false,
        mensaje: "El cuerpo de la solicitud no contiene un JSON válido",
      },
      logLevel: "warn",
    };
  }

  if (error.name === "JsonWebTokenError") {
    return {
      statusCode: 401,
      body: {
        ok: false,
        mensaje: "Token inválido",
      },
      logLevel: "warn",
    };
  }

  if (error.name === "TokenExpiredError") {
    return {
      statusCode: 401,
      body: {
        ok: false,
        mensaje: "Token expirado",
      },
      logLevel: "warn",
    };
  }

  if (error.message === "Solo se permiten imágenes JPG, PNG o WEBP") {
    return {
      statusCode: 400,
      body: {
        ok: false,
        mensaje: error.message,
      },
      logLevel: "warn",
    };
  }

  return {
    statusCode: 500,
    body: {
      ok: false,
      mensaje: "Ocurrió un error interno en el servidor",
    },
    logLevel: "error",
  };
}

function logError(error, req, statusCode, logLevel) {
  if (logLevel === "error" || statusCode >= 500) {
    logger.error("Error no controlado", {
      mensaje: error.message,
      codigo: error.code,
      metodo: req.method,
      ruta: req.originalUrl,
      stack: !isProduction ? error.stack : undefined,
    });

    return;
  }

  logger.warn("Error operacional", {
    mensaje: error.message,
    codigo: error.code,
    metodo: req.method,
    ruta: req.originalUrl,
    statusCode,
  });
}

export function notFoundMiddleware(req, res) {
  return res.status(404).json({
    ok: false,
    mensaje: "Ruta no encontrada",
  });
}

export function errorMiddleware(error, req, res, next) {
  const { statusCode, body, logLevel } = buildErrorResponse(error);

  logError(error, req, statusCode, logLevel);

  return res.status(statusCode).json(body);
}
