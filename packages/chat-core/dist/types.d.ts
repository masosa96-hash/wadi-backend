export interface Message {
    id: string;
    conversation_id: string;
    role: "user" | "assistant" | "system";
    content: string;
    created_at: string;
    model?: string;
    tokens_used?: number;
    error?: string;
}
export interface Conversation {
    id: string;
    user_id: string;
    title: string | null;
    created_at: string;
    updated_at: string;
    message_count: number;
    last_message_at: string | null;
}
export type WebSocketMessageType = "auth" | "message" | "stop" | "connected" | "authenticated" | "start" | "chunk" | "complete" | "error" | "stopped";
export interface WebSocketMessage {
    type: WebSocketMessageType;
    token?: string;
    content?: string;
    conversationId?: string;
    runId?: string;
    messageId?: string;
    timestamp?: string;
    model?: string;
    error?: string;
}
export interface ChatSummary {
    total_conversations: number;
    total_messages: number;
    recent_conversations: Conversation[];
}
export interface KivoThought {
    intent: "chat" | "command" | "query" | "creation";
    confidence: number;
    reasoning: string[];
    plan: string[];
    context_needed?: string[];
}
export interface WadiAction {
    type: "response" | "tool_call" | "error";
    payload: any;
    thought_process: KivoThought;
}
