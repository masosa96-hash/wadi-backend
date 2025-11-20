import { create } from "zustand";
import { api } from "../config/api";

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

interface ChatState {
  // Current conversation
  currentConversationId: string | null;
  currentConversation: Conversation | null;
  messages: Message[];
  
  // All conversations
  conversations: Conversation[];
  
  // Loading states
  loadingMessages: boolean;
  loadingConversations: boolean;
  sendingMessage: boolean;
  
  // Error state
  error: string | null;
  
  // Actions
  sendMessage: (message: string, conversationId?: string) => Promise<void>;
  loadConversation: (conversationId: string) => Promise<void>;
  loadConversations: () => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  clearCurrentConversation: () => void;
  clearError: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  currentConversationId: null,
  currentConversation: null,
  messages: [],
  conversations: [],
  loadingMessages: false,
  loadingConversations: false,
  sendingMessage: false,
  error: null,

  // Send a message
  sendMessage: async (message: string, conversationId?: string) => {
    const { currentConversationId } = get();
    const targetConversationId = conversationId || currentConversationId;
    
    set({ sendingMessage: true, error: null });
    
    try {
      const response = await api.post<{
        ok: boolean;
        data: {
          conversationId: string;
          userMessage: Message;
          assistantMessage: Message;
        };
      }>("/api/chat", {
        message,
        conversationId: targetConversationId,
      });

      if (!response.ok) {
        throw new Error("No pude enviar el mensaje");
      }

      const { conversationId: newConversationId, userMessage, assistantMessage } = response.data;

      // Update current conversation ID if it was created
      if (!currentConversationId) {
        set({ currentConversationId: newConversationId });
      }

      // Add messages to the list
      set((state) => ({
        messages: [...state.messages, userMessage, assistantMessage],
        sendingMessage: false,
      }));

      // Reload conversations to update counts
      get().loadConversations();
    } catch (error: any) {
      console.error("Error sending message:", error);
      
      // Friendly error messages based on error type
      let errorMessage = "No pude responder ahora. Probá de nuevo en un momento.";
      
      if (error.code === 'NETWORK_ERROR') {
        errorMessage = "Parece que no hay conexión. Revisá tu internet y volvé a intentar.";
      } else if (error.code === 'TIMEOUT') {
        errorMessage = "La respuesta está tardando mucho. Intentá de nuevo.";
      } else if (error.status === 401) {
        errorMessage = "Tu sesión expiró. Volvé a iniciar sesión.";
      } else if (error.status >= 500) {
        errorMessage = "Hubo un problema con el servidor. Probá de nuevo en unos segundos.";
      } else if (error.error) {
        if (error.error.includes('conversation')) {
          errorMessage = "No pude crear la conversación. Probá de nuevo.";
        } else if (error.error.includes('API') || error.error.includes('key')) {
          errorMessage = "Hay un problema con la configuración. Contactá a soporte.";
        }
      }
      
      set({
        sendingMessage: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  // Load a specific conversation with all messages
  loadConversation: async (conversationId: string) => {
    set({ loadingMessages: true, error: null });
    
    try {
      const response = await api.get<{
        ok: boolean;
        data: {
          conversation: Conversation;
          messages: Message[];
        };
      }>(`/api/chat/${conversationId}`);

      if (!response.ok) {
        throw new Error("Failed to load conversation");
      }

      const { conversation, messages } = response.data;

      set({
        currentConversationId: conversationId,
        currentConversation: conversation,
        messages,
        loadingMessages: false,
      });
    } catch (error: any) {
      console.error("Error loading conversation:", error);
      set({
        loadingMessages: false,
        error: error.error || error.message || "No pude cargar la conversación.",
      });
    }
  },

  // Load all conversations
  loadConversations: async () => {
    set({ loadingConversations: true, error: null });
    
    try {
      const response = await api.get<{
        ok: boolean;
        data: Conversation[];
      }>("/api/chat");

      if (!response.ok) {
        throw new Error("Failed to load conversations");
      }

      set({
        conversations: response.data,
        loadingConversations: false,
      });
    } catch (error: any) {
      console.error("Error loading conversations:", error);
      set({
        loadingConversations: false,
        error: error.error || error.message || "No pude cargar las conversaciones.",
      });
    }
  },

  // Delete a conversation
  deleteConversation: async (conversationId: string) => {
    try {
      await api.delete(`/api/chat/${conversationId}`);

      // Remove from conversations list
      set((state) => ({
        conversations: state.conversations.filter((c) => c.id !== conversationId),
      }));

      // Clear current conversation if it was deleted
      const { currentConversationId } = get();
      if (currentConversationId === conversationId) {
        set({
          currentConversationId: null,
          currentConversation: null,
          messages: [],
        });
      }
    } catch (error: any) {
      console.error("Error deleting conversation:", error);
      set({
        error: error.error || error.message || "No pude eliminar la conversación.",
      });
      throw error;
    }
  },

  // Clear current conversation
  clearCurrentConversation: () => {
    set({
      currentConversationId: null,
      currentConversation: null,
      messages: [],
    });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));
