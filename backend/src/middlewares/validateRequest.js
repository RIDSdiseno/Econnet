import { ZodError } from "zod";

function formatIssues(issues) {
  return issues.map((issue) => ({
    campo: issue.path.length > 0 ? issue.path.join(".") : "root",
    mensaje: issue.message,
  }));
}

function assignRequestValue(req, key, value) {
  try {
    req[key] = value;
  } catch {
    Object.defineProperty(req, key, {
      value,
      writable: true,
      enumerable: true,
      configurable: true,
    });
  }
}

export function validateRequest(schemas = {}) {
  return (req, res, next) => {
    try {
      if (schemas.body) {
        assignRequestValue(req, "body", schemas.body.parse(req.body));
      }

      if (schemas.params) {
        assignRequestValue(req, "params", schemas.params.parse(req.params));
      }

      if (schemas.query) {
        assignRequestValue(req, "query", schemas.query.parse(req.query));
      }

      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          ok: false,
          mensaje: "Datos inválidos",
          errores: formatIssues(error.issues),
        });
      }

      return next(error);
    }
  };
}
