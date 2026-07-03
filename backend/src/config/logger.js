import fs from "node:fs";
import path from "node:path";
import winston from "winston";

const isProduction = process.env.NODE_ENV === "production";
const logsDir = path.resolve(process.cwd(), "logs");

if (isProduction && !fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

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

const transports = isProduction
  ? [
      new winston.transports.File({
        filename: path.join(logsDir, "error.log"),
        level: "error",
      }),
    ]
  : [
      new winston.transports.Console({
        level: process.env.LOG_LEVEL || "debug",
        format: developmentFormat,
      }),
    ];

const logger = winston.createLogger({
  level: isProduction ? "error" : process.env.LOG_LEVEL || "debug",
  format: isProduction ? productionFormat : developmentFormat,
  transports,
  exitOnError: false,
});

export function serializeError(error) {
  return {
    error: error?.message || String(error),
    stack: isProduction ? undefined : error?.stack,
  };
}

export default logger;
