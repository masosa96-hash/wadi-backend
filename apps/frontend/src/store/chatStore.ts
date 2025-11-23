import { create } from "zustand";
import { api } from "../config/api";
import { supabase } from "../config/supabase";
import type { Message, Conversation, WebSocketMessage } from "../types/chat";
import { useAuthStore } from "./authStore";

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

  // WebSocket
  socket: WebSocket | null;
  isConnected: boolean;

  // Error state
  error: string | null;

  // Actions
  connect: (conversationId: string) => void;
  disconnect: () => void;
  sendMessage: (message: string) => Promise<void>;
  loadConversation: (conversationId: string) => Promise<void>;
  loadConversations: () => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  clearCurrentConversation: () => void;
  clearError: () => void;
}

export const useChatStore = create<ChatState>()((set, get) => ({
  // Initial state
  currentConversationId: null,
  currentConversation: null,
  messages: [],
  conversations: [],
  loadingMessages: false,
  loadingConversations: false,
  sendingMessage: false,
  socket: null,
  isConnected: false,
  error: null,

  // Connect to WebSocket
  connect: async (conversationId: string) => {
    const { user } = useAuthStore.getState();
    if (!user) return; // No WS for guests yet

    const { socket } = get();
    if (socket) {
      socket.close();
    }

    const wsUrl = import.meta.env.VITE_API_URL.replace("http", "ws") + `/ws/chat/${conversationId}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = async () => {
      console.log("[ChatStore] WebSocket connected");
      set({ isConnected: true });

      // Authenticate
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        ws.send(JSON.stringify({ type: "auth", token: session.access_token }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);

        switch (data.type) {
          case "start":
            set((state) => ({
              messages: [
                ...state.messages,
                {
                  id: "temp-ai-" + Date.now(),
                  conversation_id: conversationId,
                  role: "assistant",
                  content: "",
                  created_at: new Date().toISOString(),
                },
              ],
            }));
            break;

          case "chunk":
            set((state) => {
              const newMessages = [...state.messages];
              const lastMessage = newMessages[newMessages.length - 1];
              if (lastMessage && lastMessage.role === "assistant") {
                lastMessage.content += data.content;
              }
              return { messages: newMessages };
            });
            break;

          case "complete":
            set({ sendingMessage: false });
            // Reload conversations to update counts/last message
            get().loadConversations();
            break;

          case "error":
            console.error("[ChatStore] WS Error:", data.message);
            set({ error: data.message, sendingMessage: false });
            break;
        }
      } catch (error) {
        console.error("[ChatStore] Error parsing WS message:", error);
      }
    };

    ws.onclose = () => {
      console.log("[ChatStore] WebSocket disconnected");
      set({ isConnected: false, socket: null });
    };

    set({ socket: ws });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.close();
      set({ socket: null, isConnected: false });
    }
  },

  // Send a message
  sendMessage: async (message: string) => {
    const { socket, currentConversationId, connect, messages } = get();
    const { user, guestId } = useAuthStore.getState();

    if (!message.trim()) return;

    set({ sendingMessage: true, error: null });

    // Optimistic update for user message
    const tempId = "temp-user-" + Date.now();
    const newUserMessage: Message = {
      id: tempId,
      conversation_id: currentConversationId || "guest-conv",
      role: "user",
      content: message,
      created_at: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, newUserMessage],
    }));

    // --- GUEST MODE ---
    if (!user) {
      try {
        const response = await api.post<{ ok: boolean, data: { reply: string, userMessage: Message, assistantMessage: Message } }>("/api/chat", {
          message,
          messages: messages, // Send history for context
        }, {
          headers: {
            'x-guest-id': guestId || 'unknown-guest'
          }
        });

        if (response.ok) {
          const { assistantMessage } = response.data;

          set((state) => {
            const updatedMessages = [...state.messages, assistantMessage];

            // Save to local storage
            if (guestId) {
              localStorage.setItem(`wadi_conv_${guestId}`, JSON.stringify(updatedMessages));
            }

            return {
              messages: updatedMessages,
              sendingMessage: false
            };
          });
        }
      } catch (error: any) {
        console.error("Error sending guest message:", error);
        set({ error: "Error al enviar mensaje", sendingMessage: false });
      }
      return;
    }

    // --- AUTH USER MODE ---

    // If no conversation, create one first via REST
    const targetConversationId = currentConversationId;

    if (!targetConversationId) {
      try {
        const response = await api.post<{ ok: boolean, data: { conversationId: string, userMessage: Message, assistantMessage: Message } }>("/api/chat", {
          message,
        });

        if (response.ok) {
          const { conversationId, userMessage, assistantMessage } = response.data;
          set({
            currentConversationId: conversationId,
            messages: [userMessage, assistantMessage],
            sendingMessage: false
          });
          get().loadConversations();
          connect(conversationId); // Connect for next messages
          return;
        }
      } catch (error) {
        console.error("Error creating conversation:", error);
        set({ error: "Failed to start conversation", sendingMessage: false });
        return;
      }
    }

    // If we have a socket and it's open, send via WS
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "message", content: message }));
    } else {
      // Fallback to REST if WS not connected
      try {
        const response = await api.post<{ ok: boolean, data: { conversationId: string, userMessage: Message, assistantMessage: Message } }>("/api/chat", {
          message,
          conversationId: targetConversationId
        });

        if (response.ok) {
          const { assistantMessage } = response.data;
          set((state) => ({
            messages: [...state.messages, assistantMessage],
            sendingMessage: false
          }));
        }
      } catch (error) {
        console.error("Error sending message:", error);
        set({ error: "Failed to send message", sendingMessage: false });
      }
    }
  },

  // Load a specific conversation with all messages
  loadConversation: async (conversationId: string) => {
    set({ loadingMessages: true, error: null });
    const { user, guestId } = useAuthStore.getState();

    // Guest Mode
    if (!user) {
      const stored = localStorage.getItem(`wadi_conv_${guestId}`);
      if (stored) {
        set({
          messages: JSON.parse(stored),
          loadingMessages: false
        });
      } else {
        set({ messages: [], loadingMessages: false });
      }
      return;
    }

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

      // Connect WS
      get().connect(conversationId);

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
    const { user } = useAuthStore.getState();
    if (!user) return; // Guests don't have conversation list yet

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

      set((state) => ({
        conversations: state.conversations.filter((c) => c.id !== conversationId),
      }));

      const { currentConversationId } = get();
      if (currentConversationId === conversationId) {
        get().disconnect();
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
    get().disconnect();
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
