import rateLimit from "express-rate-limit";

const rateLimitResponse = {
  ok: false,
  mensaje: "Demasiados intentos. Intenta nuevamente más tarde.",
};

const createRateLimiter = ({ windowMs, limit }) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json(rateLimitResponse);
    },
  });

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 5,
});

export const registroRateLimiter = createRateLimiter({
  windowMs: 30 * 60 * 1000,
  limit: 3,
});

export const pagosRateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  limit: 20,
});
