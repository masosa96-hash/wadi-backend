"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vectorMemory = exports.VectorMemoryService = void 0;
const supabase_1 = require("../config/supabase");
const openai_1 = __importDefault(require("openai"));
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
const EMBEDDING_MODEL = "text-embedding-3-small";
const SIMILARITY_THRESHOLD = 0.7;
const MAX_MEMORIES_PER_PROJECT = 1000;
/**
 * Vector Memory Service
 * Provides long-term memory capabilities using embeddings and semantic search
 */
class VectorMemoryService {
    /**
     * Generate embedding vector for text content
     */
    async generateEmbedding(text) {
        try {
            const response = await openai.embeddings.create({
                model: EMBEDDING_MODEL,
                input: text,
            });
            return response.data[0].embedding;
        }
        catch (error) {
            console.error("Embedding generation error:", error);
            throw new Error(`Failed to generate embedding: ${error.message}`);
        }
    }
    /**
     * Store a new memory entry with embedding
     */
    async storeMemory(entry) {
        try {
            // Generate embedding if not provided
            let embedding = entry.embedding;
            if (!embedding) {
                embedding = await this.generateEmbedding(entry.content);
            }
            // Store in database
            const { data, error } = await supabase_1.supabase
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
        }
        catch (error) {
            console.error("Store memory error:", error);
            throw new Error(`Failed to store memory: ${error.message}`);
        }
    }
    /**
     * Search for relevant memories using semantic similarity
     */
    async searchMemories(userId, projectId, query, limit = 5) {
        try {
            // Generate query embedding
            const queryEmbedding = await this.generateEmbedding(query);
            // For now, fetch all memories and compute similarity in application
            // In production, use pgvector's native similarity search
            const { data: memories, error } = await supabase_1.supabase
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
            const scoredMemories = [];
            for (const memory of memories) {
                let embedding;
                try {
                    embedding = JSON.parse(memory.embedding);
                }
                catch {
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
        }
        catch (error) {
            console.error("Search memories error:", error);
            throw new Error(`Failed to search memories: ${error.message}`);
        }
    }
    /**
     * Get all memories for a project
     */
    async getProjectMemories(userId, projectId, limit = 50) {
        try {
            const { data, error } = await supabase_1.supabase
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
        }
        catch (error) {
            console.error("Get project memories error:", error);
            throw new Error(`Failed to get project memories: ${error.message}`);
        }
    }
    /**
     * Delete a specific memory
     */
    async deleteMemory(memoryId, userId) {
        try {
            const { error } = await supabase_1.supabase
                .from("memories")
                .delete()
                .eq("id", memoryId)
                .eq("user_id", userId);
            if (error) {
                throw new Error(`Database error: ${error.message}`);
            }
        }
        catch (error) {
            console.error("Delete memory error:", error);
            throw new Error(`Failed to delete memory: ${error.message}`);
        }
    }
    /**
     * Clear all memories for a project
     */
    async clearProjectMemories(userId, projectId) {
        try {
            const { error } = await supabase_1.supabase
                .from("memories")
                .delete()
                .eq("user_id", userId)
                .eq("project_id", projectId);
            if (error) {
                throw new Error(`Database error: ${error.message}`);
            }
        }
        catch (error) {
            console.error("Clear project memories error:", error);
            throw new Error(`Failed to clear project memories: ${error.message}`);
        }
    }
    /**
     * Automatically create memory from AI run
     */
    async createMemoryFromRun(userId, projectId, runId, input, output) {
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
    async getRelevantContext(userId, projectId, query, maxTokens = 2000) {
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
    async pruneOldMemories(projectId) {
        try {
            const { count, error: countError } = await supabase_1.supabase
                .from("memories")
                .select("*", { count: "exact", head: true })
                .eq("project_id", projectId);
            if (countError || !count) {
                return;
            }
            if (count > MAX_MEMORIES_PER_PROJECT) {
                const deleteCount = count - MAX_MEMORIES_PER_PROJECT;
                // Delete oldest memories
                const { data: oldMemories } = await supabase_1.supabase
                    .from("memories")
                    .select("id")
                    .eq("project_id", projectId)
                    .order("created_at", { ascending: true })
                    .limit(deleteCount);
                if (oldMemories && oldMemories.length > 0) {
                    const idsToDelete = oldMemories.map((m) => m.id);
                    await supabase_1.supabase.from("memories").delete().in("id", idsToDelete);
                }
            }
        }
        catch (error) {
            console.error("Prune memories error:", error);
            // Non-critical error, don't throw
        }
    }
    /**
     * Calculate cosine similarity between two vectors
     */
    cosineSimilarity(vecA, vecB) {
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
exports.VectorMemoryService = VectorMemoryService;
// Export singleton instance
exports.vectorMemory = new VectorMemoryService();
