import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const apiKey = process.env.GROQ_API_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.warn("Missing Groq API key. Running in SAFE MODE.");
}

// Client for Groq (Text Generation)
const llmClient = new OpenAI({
  apiKey: apiKey || "dummy_key",
  baseURL: "https://api.groq.com/openai/v1",
});

// Client for OpenAI (Embeddings, Vision)
export const openaiClient = openaiApiKey ? new OpenAI({
  apiKey: openaiApiKey,
}) : null;

export const DEFAULT_MODEL = process.env.GROQ_DEFAULT_MODEL || "llama-3.1-8b-instant";

export function mapToGroqModel(model: string): string {
  const modelMap: Record<string, string> = {
    "gpt-3.5-turbo": "llama-3.1-8b-instant",
    "gpt-4o-mini": "llama-3.1-8b-instant",
    "gpt-4.1-mini": "llama-3.1-8b-instant",
    "gpt-4": "llama-3.3-70b-versatile",
    "gpt-4-turbo": "llama-3.3-70b-versatile",
    "gpt-4o": "llama-3.3-70b-versatile",
  };
  return modelMap[model] || model;
}

export function isValidModel(model: string): boolean {
  const validModels = [
    "llama-3.1-8b-instant",
    "llama-3.3-70b-versatile",
    "gpt-3.5-turbo",
    "gpt-4o",
    "gpt-4o-mini",
    "gpt-4",
  ];
  return validModels.includes(model) || model.startsWith("llama-");
}

export async function generateChatCompletion(
  messages: Array<{ role: string; content: string }>,
  model: string = DEFAULT_MODEL
): Promise<{ response: string; model: string }> {

  if (process.env.OFFLINE_MODE === "true") {
    return {
      response: "[OFFLINE] Mode enabled. No AI response generated.",
      model: "offline-mock"
    };
  }

  try {
    const groqModel = mapToGroqModel(model);
    const completion = await llmClient.chat.completions.create({
      model: groqModel,
      messages: messages as ChatCompletionMessageParam[],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) throw new Error("No response generated");

    return { response, model: groqModel };

  } catch (e: any) {
    throw new Error(e.message || "LLM error");
  }
}

export async function generateCompletion(prompt: string, model: string = DEFAULT_MODEL): Promise<string> {
  const { response } = await generateChatCompletion([{ role: "user", content: prompt }], model);
  return response;
}

export async function* generateCompletionStream(
  messages: Array<{ role: string; content: string }>,
  model: string = DEFAULT_MODEL
): AsyncGenerator<string> {

  if (process.env.OFFLINE_MODE === "true") {
    yield "[OFFLINE STREAM] no streaming disponible en offline";
    return;
  }

  try {
    const groqModel = mapToGroqModel(model);
    const stream = await llmClient.chat.completions.create({
      model: groqModel,
      messages: messages as ChatCompletionMessageParam[],
      max_tokens: 1000,
      temperature: 0.7,
      stream: true,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content;
      if (text) yield text;
    }

  } catch (e: any) {
    throw new Error(e.message || "Stream error");
  }
}

export async function checkOpenAIHealth(): Promise<boolean> {
  try {
    await llmClient.models.list();
    return true;
  } catch {
    return false;
  }
}

export { llmClient };
