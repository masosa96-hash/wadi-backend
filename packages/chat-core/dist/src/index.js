"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cerebroDual = cerebroDual;
const kivo_1 = require("./kivo");
const wadi_1 = require("./wadi");
function cerebroDual(input) {
    const analisis = (0, kivo_1.pensar)(input);
    const respuesta = (0, wadi_1.ejecutar)(analisis);
    return respuesta;
}
