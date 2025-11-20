import { create } from 'zustand';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

interface Favorite {
  id: string;
  user_id: string;
  message_id: string;
  conversation_id: string;
  created_at: string;
  messages?: {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    created_at: string;
    conversations?: {
      id: string;
      title: string;
    };
  };
}

interface FavoritesState {
  favorites: Favorite[];
  loading: boolean;
  error: string | null;
  favoritedMessageIds: Set<string>;
  
  // Actions
  loadFavorites: () => Promise<void>;
  addFavorite: (messageId: string, conversationId: string) => Promise<void>;
  removeFavorite: (messageId: string) => Promise<void>;
  isFavorited: (messageId: string) => boolean;
  clearError: () => void;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  loading: false,
  error: null,
  favoritedMessageIds: new Set(),

  loadFavorites: async () => {
    set({ loading: true, error: null });
    
    try {
      const token = localStorage.getItem('supabase_token');
      if (!token) throw new Error('No auth token');

      const response = await fetch(`${API_URL}/api/favorites`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load favorites');
      }

      const favorites = await response.json();
      const favoritedIds = new Set<string>(favorites.map((f: Favorite) => f.message_id));
      
      set({ favorites, favoritedMessageIds: favoritedIds, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addFavorite: async (messageId: string, conversationId: string) => {
    try {
      const token = localStorage.getItem('supabase_token');
      if (!token) throw new Error('No auth token');

      const response = await fetch(`${API_URL}/api/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message_id: messageId, conversation_id: conversationId }),
      });

      if (!response.ok) {
        throw new Error('Failed to add favorite');
      }

      const favorite = await response.json();
      
      set((state) => ({
        favorites: [favorite, ...state.favorites],
        favoritedMessageIds: new Set([...state.favoritedMessageIds, messageId]),
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  removeFavorite: async (messageId: string) => {
    try {
      const token = localStorage.getItem('supabase_token');
      if (!token) throw new Error('No auth token');

      const response = await fetch(`${API_URL}/api/favorites/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to remove favorite');
      }

      set((state) => {
        const newFavorited = new Set(state.favoritedMessageIds);
        newFavorited.delete(messageId);
        
        return {
          favorites: state.favorites.filter((f) => f.message_id !== messageId),
          favoritedMessageIds: newFavorited,
        };
      });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  isFavorited: (messageId: string) => {
    return get().favoritedMessageIds.has(messageId);
  },

  clearError: () => set({ error: null }),
}));
