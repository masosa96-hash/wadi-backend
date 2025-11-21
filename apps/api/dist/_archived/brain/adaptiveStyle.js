"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stylizeReply = stylizeReply;
function stylizeReply(text) {
    const variants = [
        (t) => `→ ${t.charAt(0).toUpperCase()}${t.slice(1)}.`,
        (t) => `${t} 🔹`,
        (t) => `✅ ${t}`,
        (t) => `${t} — todo bajo control.`,
        (t) => `🧠 ${t}`,
    ];
    const random = Math.floor(Math.random() * variants.length);
    return variants[random](text.trim());
}
