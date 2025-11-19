import fs from "fs";
import path from "path";

const memoryPath = path.join(process.cwd(), "apps", "api", "data", "memory.json");

// Asegura carpeta y archivo
if (!fs.existsSync(path.dirname(memoryPath))) {
  fs.mkdirSync(path.dirname(memoryPath), { recursive: true });
}
if (!fs.existsSync(memoryPath)) {
  fs.writeFileSync(memoryPath, "[]", "utf8");
}

// Guarda interacción usuario ↔ asistente
export function saveInteraction(userMsg: string, assistantMsg: string) {
  let data: any[] = [];
  try {
    const file = fs.readFileSync(memoryPath, "utf8");
    data = JSON.parse(file || "[]");
  } catch {
    data = [];
  }

  data.push({
    user: userMsg,
    assistant: assistantMsg,
    timestamp: Date.now(),
  });

  fs.writeFileSync(
    memoryPath,
    JSON.stringify(data.slice(-50), null, 2),
    "utf8"
  );
}

// Construye perfil según frecuencia de palabras
export function buildUserProfile() {
  let data: any[] = [];
  try {
    const file = fs.readFileSync(memoryPath, "utf8");
    data = JSON.parse(file || "[]");
  } catch {
    return { topWords: [] };
  }

  const wordCount: Record<string, number> = {};

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
