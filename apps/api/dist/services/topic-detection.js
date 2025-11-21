"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectTopicChange = detectTopicChange;
exports.generateWorkspaceName = generateWorkspaceName;
exports.extractConversationTopics = extractConversationTopics;
const openai_1 = require("./openai");
/**
 * Detect if the conversation topic has changed significantly and should trigger
 * a new workspace creation
 */
async function detectTopicChange(recentMessages, currentWorkspaceTopic) {
    try {
        // Need at least 3 messages to detect a topic change
        if (recentMessages.length < 3) {
            return {
                shouldCreateWorkspace: false,
                suggestedName: "",
                suggestedTopic: "",
                confidence: 0,
                reasoning: "Not enough messages to detect topic change"
            };
        }
        // Build context from messages
        const conversationContext = recentMessages
            .map((msg) => `${msg.role === "user" ? "Usuario" : "WADI"}: ${msg.content}`)
            .join("\n");
        const detectionPrompt = `Analizá esta conversación y determiná:
1. ¿El usuario está cambiando significativamente de tema?
2. Si sí, ¿cuál es el nuevo tema principal?
3. Sugerí un nombre corto y descriptivo para un workspace (máximo 4 palabras)

Contexto del workspace actual: ${currentWorkspaceTopic || "Ninguno (conversación general)"}

Conversación reciente:
${conversationContext}

Respondé SOLO en formato JSON con esta estructura exacta:
{
  "topic_changed": boolean,
  "new_topic": "descripción breve del tema",
  "suggested_name": "Nombre Corto del Workspace",
  "confidence": 0.0 a 1.0,
  "reasoning": "Por qué sí o no cambió el tema"
}`;
        const response = await (0, openai_1.generateChatCompletion)([
            {
                role: "system",
                content: "Sos un analizador de conversaciones. Respondés SOLO en formato JSON válido, sin texto adicional.",
            },
            {
                role: "user",
                content: detectionPrompt,
            },
        ], "gpt-3.5-turbo");
        // Parse JSON response
        const cleanResponse = response.trim().replace(/```json\n?/g, "").replace(/```\n?/g, "");
        const result = JSON.parse(cleanResponse);
        console.log("[TopicDetection] Analysis result:", result);
        return {
            shouldCreateWorkspace: result.topic_changed === true && result.confidence >= 0.7,
            suggestedName: result.suggested_name || "",
            suggestedTopic: result.new_topic || "",
            confidence: result.confidence || 0,
            reasoning: result.reasoning || "",
        };
    }
    catch (error) {
        console.error("[TopicDetection] Error detecting topic change:", error);
        return {
            shouldCreateWorkspace: false,
            suggestedName: "",
            suggestedTopic: "",
            confidence: 0,
            reasoning: `Error: ${error.message}`,
        };
    }
}
/**
 * Generate a workspace name from conversation context
 */
async function generateWorkspaceName(messages) {
    try {
        const conversationSummary = messages
            .slice(-5)
            .map((msg) => msg.content)
            .join(" ")
            .substring(0, 500);
        const response = await (0, openai_1.generateChatCompletion)([
            {
                role: "system",
                content: "Generá un nombre corto y descriptivo (máximo 4 palabras) para un workspace basado en la conversación. Respondé SOLO el nombre, sin comillas ni puntuación adicional.",
            },
            {
                role: "user",
                content: `Conversación: ${conversationSummary}`,
            },
        ], "gpt-3.5-turbo");
        return response.trim().replace(/["']/g, "").substring(0, 50);
    }
    catch (error) {
        console.error("[TopicDetection] Error generating workspace name:", error);
        return "Nuevo Espacio";
    }
}
/**
 * Extract key topics from a conversation for tagging
 */
async function extractConversationTopics(messages) {
    try {
        const conversationText = messages
            .filter((msg) => msg.role === "user")
            .map((msg) => msg.content)
            .join(" ")
            .substring(0, 1000);
        const response = await (0, openai_1.generateChatCompletion)([
            {
                role: "system",
                content: 'Extraé los 3-5 temas principales de esta conversación. Respondé SOLO en formato JSON: {"topics": ["tema1", "tema2", ...]}',
            },
            {
                role: "user",
                content: conversationText,
            },
        ], "gpt-3.5-turbo");
        const cleanResponse = response.trim().replace(/```json\n?/g, "").replace(/```\n?/g, "");
        const result = JSON.parse(cleanResponse);
        return result.topics || [];
    }
    catch (error) {
        console.error("[TopicDetection] Error extracting topics:", error);
        return [];
    }
}
