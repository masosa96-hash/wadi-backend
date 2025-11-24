import OpenAI from "openai";

// Groq API configuration (primary LLM provider)
const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  throw new Error(
    "Missing Groq API key. Please check GROQ_API_KEY in .env"
  );
}

// Create OpenAI-compatible client pointing to Groq
const llmClient = new OpenAI({
  apiKey: apiKey,
  baseURL: "https://api.groq.com/openai/v1",
});

// Use Groq models by default
const DEFAULT_MODEL = process.env.GROQ_DEFAULT_MODEL || "llama-3.1-8b-instant";

// Legacy OpenAI client for embeddings and fallback (optional)
let openaiClient: OpenAI | null = null;
if (process.env.OPENAI_API_KEY) {
  openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

/**
 * Generate AI response using Groq Chat Completion API with conversation history
 * @param messages Array of message objects with role and content
 * @param model Optional model name (defaults to env var or llama-3.1-8b-instant)
 * @returns AI-generated response text
 */
export async function generateChatCompletion(
  messages: Array<{ role: string; content: string }>,
  model: string = DEFAULT_MODEL
): Promise<string> {
  try {
    const completion = await llmClient.chat.completions.create({
      model: model,
      messages: messages as any,
      max_tokens: 1000,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      throw new Error("No response generated from LLM");
    }

    return response;
  } catch (error: any) {
    // Handle API errors
    if (error.response) {
      console.error("LLM API error:", error.response.status, error.response.data);

      if (error.response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }

      if (error.response.status === 401) {
        throw new Error("Invalid LLM API key");
      }

      throw new Error(`LLM API error: ${error.response.data?.error?.message || "Unknown error"}`);
    }

    console.error("LLM service error:", error);
    throw new Error("Failed to generate AI response");
  }
}

/**
 * Generate AI response using Groq Chat Completion API
 * @param input User input text
 * @param model Optional model name (defaults to env var or llama-3.1-8b-instant)
 * @returns AI-generated response text
 */
export async function generateCompletion(
  input: string,
  model: string = DEFAULT_MODEL
): Promise<string> {
  try {
    const completion = await llmClient.chat.completions.create({
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
      throw new Error("No response generated from LLM");
    }

    return response;
  } catch (error: any) {
    // Handle API errors
    if (error.response) {
      console.error("LLM API error:", error.response.status, error.response.data);

      if (error.response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }

      if (error.response.status === 401) {
        throw new Error("Invalid LLM API key");
      }

      throw new Error(`LLM API error: ${error.response.data?.error?.message || "Unknown error"}`);
    }

    console.error("LLM service error:", error);
    throw new Error("Failed to generate AI response");
  }
}

/**
 * Validate if a model name is supported by Groq
 * @param model Model name to validate
 * @returns True if model is valid
 */
export function isValidModel(model: string): boolean {
  const validModels = [
    "llama-3.1-8b-instant",
    "llama-3.3-70b-versatile",
    "mixtral-8x7b-32768",
    "gemma-7b-it",
    // Legacy OpenAI models for backward compatibility
    "gpt-3.5-turbo",
    "gpt-4",
    "gpt-4-turbo",
    "gpt-4o",
    "gpt-4o-mini",
  ];

  return validModels.includes(model);
}

/**
 * Generate AI response with streaming using Groq Chat Completion API
 * @param messages Array of message objects with role and content
 * @param model Optional model name (defaults to env var or llama-3.1-8b-instant)
 * @returns AsyncGenerator yielding text chunks
 */
export async function* generateCompletionStream(
  messages: Array<{ role: string; content: string }>,
  model: string = DEFAULT_MODEL
): AsyncGenerator<string, void, unknown> {
  try {
    const stream = await llmClient.chat.completions.create({
      model: model,
      messages: messages as any,
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
  } catch (error: any) {
    // Handle API errors
    if (error.response) {
      console.error("LLM API error:", error.response.status, error.response.data);

      if (error.response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }

      if (error.response.status === 401) {
        throw new Error("Invalid LLM API key");
      }

      throw new Error(`LLM API error: ${error.response.data?.error?.message || "Unknown error"}`);
    }

    console.error("LLM service error:", error);
    throw new Error("Failed to generate AI response");
  }
}

/**
 * Check if LLM API (Groq) is accessible and healthy
 * @returns Promise<boolean> True if LLM API is accessible
 */
export async function checkOpenAIHealth(): Promise<boolean> {
  try {
    // Quick test: list models (lightweight API call)
    await llmClient.models.list();
    return true;
  } catch (error) {
    console.error("LLM health check failed:", error);
    return false;
  }
}

/**
 * Export the LLM client for direct access if needed
 */
export { llmClient };
export { openaiClient }; // For embeddings and other OpenAI-specific features
