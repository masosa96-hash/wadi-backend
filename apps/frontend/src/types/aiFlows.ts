export interface AIPreset {
    id: string;
    name: string;
    description: string;
    promptTemplate: string;
    icon: string;
    category: "writing" | "coding" | "analysis" | "productivity";
    workspaceId?: string; // If null, it's a system preset
}

export const SYSTEM_PRESETS: AIPreset[] = [
    {
        id: "summarize",
        name: "Resumir Documento",
        description: "Genera un resumen conciso de cualquier texto o archivo.",
        promptTemplate: "Por favor resume el siguiente contenido destacando los puntos clave:\n\n{{content}}",
        icon: "📝",
        category: "analysis",
    },
    {
        id: "improve_code",
        name: "Mejorar Código",
        description: "Analiza y optimiza código para mejor rendimiento y legibilidad.",
        promptTemplate: "Analiza el siguiente código y sugiere mejoras de rendimiento, seguridad y estilo:\n\n{{content}}",
        icon: "💻",
        category: "coding",
    },
    {
        id: "email_reply",
        name: "Responder Email",
        description: "Genera una respuesta profesional a un correo electrónico.",
        promptTemplate: "Genera una respuesta profesional y amable para el siguiente correo:\n\n{{content}}",
        icon: "✉️",
        category: "writing",
    },
];
