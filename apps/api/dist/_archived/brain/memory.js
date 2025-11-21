"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveInteraction = saveInteraction;
exports.buildUserProfile = buildUserProfile;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const memoryPath = path_1.default.join(process.cwd(), "apps", "api", "data", "memory.json");
// Asegura carpeta y archivo
if (!fs_1.default.existsSync(path_1.default.dirname(memoryPath))) {
    fs_1.default.mkdirSync(path_1.default.dirname(memoryPath), { recursive: true });
}
if (!fs_1.default.existsSync(memoryPath)) {
    fs_1.default.writeFileSync(memoryPath, "[]", "utf8");
}
// Guarda interacción usuario ↔ asistente
function saveInteraction(userMsg, assistantMsg) {
    let data = [];
    try {
        const file = fs_1.default.readFileSync(memoryPath, "utf8");
        data = JSON.parse(file || "[]");
    }
    catch {
        data = [];
    }
    data.push({
        user: userMsg,
        assistant: assistantMsg,
        timestamp: Date.now(),
    });
    fs_1.default.writeFileSync(memoryPath, JSON.stringify(data.slice(-50), null, 2), "utf8");
}
// Construye perfil según frecuencia de palabras
function buildUserProfile() {
    let data = [];
    try {
        const file = fs_1.default.readFileSync(memoryPath, "utf8");
        data = JSON.parse(file || "[]");
    }
    catch {
        return { topWords: [] };
    }
    const wordCount = {};
    for (const msg of data) {
        const words = msg.user.toLowerCase().match(/\b[a-záéíóúüñ]+\b/g);
        if (words) {
            for (const w of words) {
                wordCount[w] = (wordCount[w] || 0) + 1;
            }
        }
    }
    const topWords = Object.entries(wordCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([w]) => w);
    return { topWords };
}
