import { rateLimit } from "express-rate-limit";

// Límite general
export const generalApiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 100,
  message: "Too many requests",
});

// Límite para crear runs
export const runCreationLimiter = rateLimit({
  windowMs: 10 * 1000,
  max: 5,
  message: "Too many run creation requests",
});

// Límite para crear sesiones
export const sessionCreationLimiter = rateLimit({
  windowMs: 10 * 1000,
  max: 5,
  message: "Too many session creation requests",
});

// Límite para compartir links
export const shareLinkLimiter = rateLimit({
  windowMs: 30 * 1000,
  max: 10,
  message: "Too many share link requests",
});

// Límite para chat de invitados (guests)
export const guestChatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 20, // 20 mensajes por minuto
  message: "Demasiadas solicitudes. Por favor, esperá un momento antes de enviar más mensajes.",
  standardHeaders: true,
  legacyHeaders: false,
});
