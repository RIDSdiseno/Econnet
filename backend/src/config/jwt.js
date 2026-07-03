const MIN_JWT_SECRET_LENGTH = 64;

export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

if (!JWT_SECRET) {
  throw new Error("Falta configurar JWT_SECRET en las variables de entorno.");
}

if (JWT_SECRET.length < MIN_JWT_SECRET_LENGTH) {
  throw new Error(
    `JWT_SECRET debe tener al menos ${MIN_JWT_SECRET_LENGTH} caracteres.`,
  );
}
