import rateLimit, { ipKeyGenerator } from "express-rate-limit";

export const generalApiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    return ipKeyGenerator(req);
  },
});
