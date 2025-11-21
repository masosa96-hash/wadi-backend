"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateChatCompletion = generateChatCompletion;
exports.generateCompletion = generateCompletion;
exports.isValidModel = isValidModel;
exports.generateCompletionStream = generateCompletionStream;
const openai_1 = __importDefault(require("openai"));
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
    throw new Error("Missing OpenAI API key. Please check OPENAI_API_KEY in .env");
}
const openai = new openai_1.default({
    apiKey: apiKey,
});
const DEFAULT_MODEL = process.env.OPENAI_DEFAULT_MODEL || "gpt-3.5-turbo";
/**
 * Generate AI response using OpenAI Chat Completion API with conversation history
 * @param messages Array of message objects with role and content
 * @param model Optional model name (defaults to env var or gpt-3.5-turbo)
 * @returns AI-generated response text
 */
async function generateChatCompletion(messages, model = DEFAULT_MODEL) {
    try {
        const completion = await openai.chat.completions.create({
            model: model,
            messages: messages,
            max_tokens: 1000,
            temperature: 0.7,
        });
        const response = completion.choices[0]?.message?.content;
        if (!response) {
            throw new Error("No response generated from OpenAI");
        }
        return response;
    }
    catch (error) {
        // Handle OpenAI API errors
        if (error.response) {
            console.error("OpenAI API error:", error.response.status, error.response.data);
            if (error.response.status === 429) {
                throw new Error("Rate limit exceeded. Please try again later.");
            }
            if (error.response.status === 401) {
                throw new Error("Invalid OpenAI API key");
            }
            throw new Error(`OpenAI API error: ${error.response.data?.error?.message || "Unknown error"}`);
        }
        console.error("OpenAI service error:", error);
        throw new Error("Failed to generate AI response");
    }
}
/**
 * Generate AI response using OpenAI Chat Completion API
 * @param input User input text
 * @param model Optional model name (defaults to env var or gpt-3.5-turbo)
 * @returns AI-generated response text
 */
async function generateCompletion(input, model = DEFAULT_MODEL) {
    try {
        const completion = await openai.chat.completions.create({
            model: model,
            messages: [
                {
                    role: "user",
                    content: input,
                },
            ],
            max_tokens: 1000, // Reasonable limit to prevent excessive usage
            temperature: 0.7,
        });
        const response = completion.choices[0]?.message?.content;
        if (!response) {
            throw new Error("No response generated from OpenAI");
        }
        return response;
    }
    catch (error) {
        // Handle OpenAI API errors
        if (error.response) {
            console.error("OpenAI API error:", error.response.status, error.response.data);
            if (error.response.status === 429) {
                throw new Error("Rate limit exceeded. Please try again later.");
            }
            if (error.response.status === 401) {
                throw new Error("Invalid OpenAI API key");
            }
            throw new Error(`OpenAI API error: ${error.response.data?.error?.message || "Unknown error"}`);
        }
        console.error("OpenAI service error:", error);
        throw new Error("Failed to generate AI response");
    }
}
/**
 * Validate if a model name is supported
 * @param model Model name to validate
 * @returns True if model is valid
 */
function isValidModel(model) {
    const validModels = [
        "gpt-3.5-turbo",
        "gpt-4",
        "gpt-4-turbo",
        "gpt-4o",
        "gpt-4o-mini",
    ];
    return validModels.includes(model);
}
/**
 * Generate AI response with streaming using OpenAI Chat Completion API
 * @param messages Array of message objects with role and content
 * @param model Optional model name (defaults to env var or gpt-3.5-turbo)
 * @returns AsyncGenerator yielding text chunks
 */
async function* generateCompletionStream(messages, model = DEFAULT_MODEL) {
    try {
        const stream = await openai.chat.completions.create({
            model: model,
            messages: messages,
            max_tokens: 1000,
            temperature: 0.7,
            stream: true,
        });
        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
                yield content;
            }
        }
    }
    catch (error) {
        // Handle OpenAI API errors
        if (error.response) {
            console.error("OpenAI API error:", error.response.status, error.response.data);
            if (error.response.status === 429) {
                throw new Error("Rate limit exceeded. Please try again later.");
            }
            if (error.response.status === 401) {
                throw new Error("Invalid OpenAI API key");
            }
            throw new Error(`OpenAI API error: ${error.response.data?.error?.message || "Unknown error"}`);
        }
        console.error("OpenAI service error:", error);
        throw new Error("Failed to generate AI response");
    }
}
