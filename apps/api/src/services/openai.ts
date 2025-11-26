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
 * @returns Object with AI response text and actual model used
 */
export async function generateChatCompletion(
  messages: Array<{ role: string; content: string }>,
  model: string = DEFAULT_MODEL
): Promise<{ response: string; model: string }> {
  // OFFLINE MODE: Return mock response for development without internet
  if (process.env.OFFLINE_MODE === 'true') {
    console.log('[OFFLINE MODE] Returning mock AI response');
    const userMessage = messages[messages.length - 1]?.content || '';
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      response: `[Modo Offline] Recibí tu mensaje: "${userMessage.substring(0, 100)}${userMessage.length > 100 ? '...' : ''}". Esta es una respuesta simulada para desarrollo sin conexión a internet. Para obtener respuestas reales de IA, desactivá OFFLINE_MODE en el archivo .env`,
      model: 'offline-mock'
    };
  }
  
  try {
    // Map OpenAI models to Groq equivalents
    const groqModel = mapToGroqModel(model);
    console.log(`[Chat Service] Generating completion with model: ${model} -> ${groqModel}`);
    console.log(`[Chat Service] Message count: ${messages.length}`);
    
    const completion = await llmClient.chat.completions.create({
      model: groqModel,
      messages: messages as any,
      max_tokens: 1000,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      console.error("[Chat Service] No response generated from LLM");
      throw new Error("No response generated from LLM");
    }

    console.log(`[Chat Service] Response generated successfully, length: ${response.length} chars`);
    return { response, model: groqModel };
  } catch (error: any) {
    // Detailed error logging
    console.error("[Chat Service] Error details:", {
      message: error.message,
      status: error.status,
      type: error.type,
      code: error.code,
    });

    // Handle specific API errors
    if (error.status === 429) {
      throw new Error("Rate limit exceeded. Please try again later.");
    }

    if (error.status === 401 || error.status === 403) {
      throw new Error("LLM API authentication failed. Please check GROQ_API_KEY configuration.");
    }

    if (error.status === 400) {
      const errorMessage = error.message || "Invalid request to LLM API";
      console.error("[Chat Service] Bad request:", errorMessage);
      throw new Error(`LLM API error: ${errorMessage}`);
    }

    if (error.status === 404) {
      throw new Error(`Model '${model}' not found. Please check model name or use a supported model.`);
    }

    if (error.status >= 500) {
      throw new Error("LLM service is temporarily unavailable. Please try again later.");
    }

    // Handle network errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      throw new Error("Cannot connect to LLM service. Please check your network connection.");
    }

    // Generic error with as much detail as possible
    const errorMsg = error.message || "Unknown error occurred";
    console.error("[Chat Service] Unexpected error:", error);
    throw new Error(`Failed to generate AI response: ${errorMsg}`);
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
    // Map OpenAI models to Groq equivalents
    const groqModel = mapToGroqModel(model);
    console.log(`[OpenAI Service] Generating completion with model: ${model} -> ${groqModel}`);
    console.log(`[OpenAI Service] Input length: ${input.length} chars`);
    
    const completion = await llmClient.chat.completions.create({
      model: groqModel,
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
      console.error("[OpenAI Service] No response generated from LLM");
      throw new Error("No response generated from LLM");
    }

    console.log(`[OpenAI Service] Response generated successfully, length: ${response.length} chars`);
    return response;
  } catch (error: any) {
    // Detailed error logging
    console.error("[OpenAI Service] Error details:", {
      message: error.message,
      status: error.status,
      type: error.type,
      code: error.code,
    });

    // Handle specific API errors
    if (error.status === 429) {
      throw new Error("Rate limit exceeded. Please try again later.");
    }

    if (error.status === 401 || error.status === 403) {
      throw new Error("LLM API authentication failed. Please check API key configuration.");
    }

    if (error.status === 400) {
      const errorMessage = error.message || "Invalid request to LLM API";
      console.error("[OpenAI Service] Bad request:", errorMessage);
      throw new Error(`LLM API error: ${errorMessage}`);
    }

    if (error.status === 404) {
      throw new Error(`Model '${model}' not found. Please check model name or use a supported model.`);
    }

    if (error.status >= 500) {
      throw new Error("LLM service is temporarily unavailable. Please try again later.");
    }

    // Handle network errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      throw new Error("Cannot connect to LLM service. Please check your network connection.");
    }

    // Generic error with as much detail as possible
    const errorMsg = error.message || "Unknown error occurred";
    console.error("[OpenAI Service] Unexpected error:", error);
    throw new Error(`Failed to generate AI response: ${errorMsg}`);
  }
}

/**
 * Validate if a model name is supported by Groq
 * Also maps legacy OpenAI model names to equivalent Groq models
 * @param model Model name to validate
 * @returns True if model is valid
 */
export function isValidModel(model: string): boolean {
  const validModels = [
    "llama-3.1-8b-instant",
    "llama-3.3-70b-versatile",
    "mixtral-8x7b-32768",
    "gemma-7b-it",
    // Legacy OpenAI models - accepted for backward compatibility
    "gpt-3.5-turbo",
    "gpt-4",
    "gpt-4-turbo",
    "gpt-4o",
    "gpt-4o-mini",
    "gpt-4.1-mini",
  ];

  return validModels.includes(model);
}

/**
 * Map OpenAI model names to Groq equivalents
 * @param model Model name (potentially OpenAI)
 * @returns Groq-compatible model name
 */
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
export { DEFAULT_MODEL }; // Export default model name
