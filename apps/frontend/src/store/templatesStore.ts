import { create } from 'zustand';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export interface Template {
  id: string;
  name: string;
  description: string;
  prompt: string;
  icon: string;
  category: 'general' | 'social' | 'productivity';
}

interface TemplatesState {
  templates: Template[];
  loading: boolean;
  error: string | null;
  
  // Actions
  loadTemplates: () => Promise<void>;
  getTemplateById: (id: string) => Template | undefined;
  clearError: () => void;
}

export const useTemplatesStore = create<TemplatesState>((set, get) => ({
  templates: [],
  loading: false,
  error: null,

  loadTemplates: async () => {
    set({ loading: true, error: null });
    
    try {
      const token = localStorage.getItem('supabase_token');
      if (!token) throw new Error('No auth token');

      const response = await fetch(`${API_URL}/api/templates`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load templates');
      }

      const templates = await response.json();
      set({ templates, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  getTemplateById: (id: string) => {
    return get().templates.find((t) => t.id === id);
  },

  clearError: () => set({ error: null }),
}));
