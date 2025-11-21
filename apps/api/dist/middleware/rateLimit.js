"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shareLinkLimiter = exports.sessionCreationLimiter = exports.runCreationLimiter = exports.generalApiLimiter = void 0;
const express_rate_limit_1 = require("express-rate-limit");
// Límite general
exports.generalApiLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 60 * 1000, // 1 min
    max: 100,
    message: "Too many requests",
});
// Límite para crear runs
exports.runCreationLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 10 * 1000,
    max: 5,
    message: "Too many run creation requests",
});
// Límite para crear sesiones
exports.sessionCreationLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 10 * 1000,
    max: 5,
    message: "Too many session creation requests",
});
// Límite para compartir links
exports.shareLinkLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 30 * 1000,
    max: 10,
    message: "Too many share link requests",
});
