import { supabase } from "../config/supabase";
import { openaiClient } from "./openai";

// Use OpenAI for embeddings (Groq doesn't support embeddings yet)
if (!openaiClient) {
  console.warn("OpenAI client not available. Embeddings will not work without OPENAI_API_KEY.");
}

const EMBEDDING_MODEL = "text-embedding-3-small";
const SIMILARITY_THRESHOLD = 0.7;
const MAX_MEMORIES_PER_PROJECT = 1000;

export interface MemoryEntry {
  id?: string;
  user_id: string;
  project_id: string;
  content: string;
  embedding?: number[];
  metadata?: Record<string, any>;
  run_id?: string;
  created_at?: string;
}

export interface MemorySearchResult {
  id: string;
  content: string;
  metadata?: Record<string, any>;
  similarity: number;
  created_at: string;
}

/**
 * Vector Memory Service
 * Provides long-term memory capabilities using embeddings and semantic search
 */
export class VectorMemoryService {
  /**
   * Generate embedding vector for text content
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      if (!openaiClient) {
        throw new Error("OpenAI client not available. OPENAI_API_KEY is required for embeddings.");
      }

      const response = await openaiClient.embeddings.create({
        model: EMBEDDING_MODEL,
        input: text,
      });

      return response.data[0].embedding;
    } catch (error: any) {
      console.error("Embedding generation error:", error);
      throw new Error(`Failed to generate embedding: ${error.message}`);
    }
  }

  /**
   * Store a new memory entry with embedding
   */
  async storeMemory(entry: MemoryEntry): Promise<string> {
    try {
      // Generate embedding if not provided
      let embedding = entry.embedding;
      if (!embedding) {
        embedding = await this.generateEmbedding(entry.content);
      }

      // Store in database
      const { data, error } = await supabase
        .from("memories")
        .insert({
          user_id: entry.user_id,
          project_id: entry.project_id,
          content: entry.content,
          embedding: JSON.stringify(embedding), // Store as JSON for now
          metadata: entry.metadata || {},
          run_id: entry.run_id,
        })
        .select("id")
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      // Check if project has too many memories, prune oldest if needed
      await this.pruneOldMemories(entry.project_id);

      return data.id;
    } catch (error: any) {
      console.error("Store memory error:", error);
      throw new Error(`Failed to store memory: ${error.message}`);
    }
  }

  /**
   * Search for relevant memories using semantic similarity
   */
  async searchMemories(
    userId: string,
    projectId: string,
    query: string,
    limit: number = 5
  ): Promise<MemorySearchResult[]> {
    try {
      // Generate query embedding
      const queryEmbedding = await this.generateEmbedding(query);

      // For now, fetch all memories and compute similarity in application
      // In production, use pgvector's native similarity search
      const { data: memories, error } = await supabase
        .from("memories")
        .select("*")
        .eq("user_id", userId)
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(100); // Fetch recent memories for comparison

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      if (!memories || memories.length === 0) {
        return [];
      }

      // Compute similarities
      const scoredMemories: MemorySearchResult[] = [];
      
      for (const memory of memories) {
        let embedding: number[];
        try {
          embedding = JSON.parse(memory.embedding);
        } catch {
          continue;
        }

        const similarity = this.cosineSimilarity(queryEmbedding, embedding);

        if (similarity >= SIMILARITY_THRESHOLD) {
          scoredMemories.push({
            id: memory.id,
            content: memory.content,
            metadata: memory.metadata,
            similarity,
            created_at: memory.created_at,
          });
        }
      }

      const results = scoredMemories
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      return results;
    } catch (error: any) {
      console.error("Search memories error:", error);
      throw new Error(`Failed to search memories: ${error.message}`);
    }
  }

  /**
   * Get all memories for a project
   */
  async getProjectMemories(
    userId: string,
    projectId: string,
    limit: number = 50
  ): Promise<MemoryEntry[]> {
    try {
      const { data, error } = await supabase
        .from("memories")
        .select("*")
        .eq("user_id", userId)
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return data || [];
    } catch (error: any) {
      console.error("Get project memories error:", error);
      throw new Error(`Failed to get project memories: ${error.message}`);
    }
  }

  /**
   * Delete a specific memory
   */
  async deleteMemory(memoryId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("memories")
        .delete()
        .eq("id", memoryId)
        .eq("user_id", userId);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }
    } catch (error: any) {
      console.error("Delete memory error:", error);
      throw new Error(`Failed to delete memory: ${error.message}`);
    }
  }

  /**
   * Clear all memories for a project
   */
  async clearProjectMemories(userId: string, projectId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("memories")
        .delete()
        .eq("user_id", userId)
        .eq("project_id", projectId);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }
    } catch (error: any) {
      console.error("Clear project memories error:", error);
      throw new Error(`Failed to clear project memories: ${error.message}`);
    }
  }

  /**
   * Automatically create memory from AI run
   */
  async createMemoryFromRun(
    userId: string,
    projectId: string,
    runId: string,
    input: string,
    output: string
  ): Promise<string> {
    // Combine input and output for memory content
    const content = `User Query: ${input}\n\nAI Response: ${output}`;

    return await this.storeMemory({
      user_id: userId,
      project_id: projectId,
      content,
      metadata: {
        source: "ai_run",
        input_length: input.length,
        output_length: output.length,
      },
      run_id: runId,
    });
  }

  /**
   * Get relevant context for AI query
   */
  async getRelevantContext(
    userId: string,
    projectId: string,
    query: string,
    maxTokens: number = 2000
  ): Promise<string> {
    const memories = await this.searchMemories(userId, projectId, query, 10);

    if (memories.length === 0) {
      return "";
    }

    // Build context string, respecting token limit
    let context = "## Relevant Previous Interactions:\n\n";
    let currentTokens = 0;

    for (const memory of memories) {
      const memoryText = `**Memory (Similarity: ${(memory.similarity * 100).toFixed(1)}%)**\n${memory.content}\n\n`;
      const estimatedTokens = memoryText.length / 4; // Rough estimation

      if (currentTokens + estimatedTokens > maxTokens) {
        break;
      }

      context += memoryText;
      currentTokens += estimatedTokens;
    }

    return context;
  }

  /**
   * Prune old memories if project exceeds limit
   */
  private async pruneOldMemories(projectId: string): Promise<void> {
    try {
      const { count, error: countError } = await supabase
        .from("memories")
        .select("*", { count: "exact", head: true })
        .eq("project_id", projectId);

      if (countError || !count) {
        return;
      }

      if (count > MAX_MEMORIES_PER_PROJECT) {
        const deleteCount = count - MAX_MEMORIES_PER_PROJECT;

        // Delete oldest memories
        const { data: oldMemories } = await supabase
          .from("memories")
          .select("id")
          .eq("project_id", projectId)
          .order("created_at", { ascending: true })
          .limit(deleteCount);

        if (oldMemories && oldMemories.length > 0) {
          const idsToDelete = oldMemories.map((m) => m.id);

          await supabase.from("memories").delete().in("id", idsToDelete);
        }
      }
    } catch (error) {
      console.error("Prune memories error:", error);
      // Non-critical error, don't throw
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error("Vectors must have the same length");
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (normA * normB);
  }
}

// Export singleton instance
export const vectorMemory = new VectorMemoryService();
