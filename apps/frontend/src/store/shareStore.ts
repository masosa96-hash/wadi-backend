import { create } from 'zustand';
import { supabase } from '../config/supabase';

export interface SharedConversation {
    id: string;
    conversation_id: string;
    share_token: string;
    created_at: string;
    expires_at: string | null;
    view_count: number;
    is_active: boolean;
}

interface ShareState {
    shares: SharedConversation[];
    loading: boolean;
    error: string | null;

    createShare: (conversationId: string, expiresInDays?: number) => Promise<string>;
    getShareByToken: (token: string) => Promise<any>;
    deleteShare: (shareId: string) => Promise<void>;
    fetchMyShares: () => Promise<void>;
}

export const useShareStore = create<ShareState>((set, get) => ({
    shares: [],
    loading: false,
    error: null,

    createShare: async (conversationId: string, expiresInDays?: number) => {
        set({ loading: true, error: null });
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // Generate unique token
            const shareToken = crypto.randomUUID();

            const expiresAt = expiresInDays
                ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
                : null;

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/shares`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
                },
                body: JSON.stringify({
                    conversation_id: conversationId,
                    share_token: shareToken,
                    expires_at: expiresAt,
                }),
            });

            if (!response.ok) throw new Error('Failed to create share');

            const data = await response.json();
            set({ loading: false });

            // Return the shareable URL
            return `${window.location.origin}/shared/${shareToken}`;
        } catch (error: any) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    getShareByToken: async (token: string) => {
        set({ loading: true, error: null });
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/shares/${token}`);

            if (!response.ok) throw new Error('Share not found or expired');

            const data = await response.json();
            set({ loading: false });
            return data;
        } catch (error: any) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    deleteShare: async (shareId: string) => {
        set({ loading: true, error: null });
        try {
            const { data: { session } } = await supabase.auth.getSession();

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/shares/${shareId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session?.access_token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to delete share');

            set((state) => ({
                shares: state.shares.filter(s => s.id !== shareId),
                loading: false,
            }));
        } catch (error: any) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    fetchMyShares: async () => {
        set({ loading: true, error: null });
        try {
            const { data: { session } } = await supabase.auth.getSession();

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/shares`, {
                headers: {
                    'Authorization': `Bearer ${session?.access_token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch shares');

            const data = await response.json();
            set({ shares: data, loading: false });
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },
}));
