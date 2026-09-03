import winston from "winston";

const isProduction = process.env.NODE_ENV === "production";
const nivelesValidos = new Set(Object.keys(winston.config.npm.levels));
const nivelPorDefecto = isProduction ? "info" : "debug";
const nivelSolicitado = process.env.LOG_LEVEL?.trim().toLowerCase();
const nivelInvalido =
  Boolean(nivelSolicitado) && !nivelesValidos.has(nivelSolicitado);

const nivelLogger = nivelInvalido
  ? nivelPorDefecto
  : nivelSolicitado || nivelPorDefecto;

const baseFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
);

const developmentFormat = winston.format.combine(
  baseFormat,
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metadata = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";

    return `${timestamp} [${level}] ${message}${metadata}`;
  }),
);

const productionFormat = winston.format.combine(
  baseFormat,
  winston.format.json(),
);

const logger = winston.createLogger({
  level: nivelLogger,
  format: isProduction ? productionFormat : developmentFormat,
  transports: [
    new winston.transports.Console({
      level: nivelLogger,
    }),
  ],
  exitOnError: false,
});

if (nivelInvalido) {
  logger.warn("LOG_LEVEL invalido; se usara el nivel por defecto", {
    logLevel: nivelSolicitado,
    nivel: nivelLogger,
  });
}

export function serializeError(error) {
  return {
    error: error?.message || String(error),
    stack: isProduction ? undefined : error?.stack,
  };
}

export default logger;
