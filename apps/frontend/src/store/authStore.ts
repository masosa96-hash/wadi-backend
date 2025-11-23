import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "../config/supabase";
import type { User, Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  guestId: string | null;
  guestNick: string | null;

  // Actions
  requestPasswordReset: (email: string) => Promise<void>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;

  setGuestNick: (nick: string) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      loading: true,
      guestId: null,
      guestNick: null,

      setGuestNick: (nick: string) => set({ guestNick: nick }),

      signIn: async (email: string, password: string) => {
        // Clear any existing session first
        await supabase.auth.signOut();

        // Sign in with password
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        set({ user: data.user, session: data.session });
      },

      signUp: async (email: string, password: string, displayName: string) => {
        // Create auth user with metadata
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: displayName,
            },
          },
        });

        if (error) throw error;
        if (!data.user) throw new Error("User creation failed");

        // Profile creation is handled by the database trigger 'handle_new_user'
        // However, we also attempt a manual insert as a fallback/redundancy
        // to ensure the profile exists immediately for the user.
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: data.user.id,
                full_name: displayName,
                email: email,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }
            ])
            .select()
            .single();

          if (profileError) {
            // If it fails, it might be because the trigger already created it (duplicate key)
            // We can ignore this specific error or log it.
            console.log("Manual profile creation note:", profileError.message);
          }
        } catch (e) {
          console.error("Error attempting manual profile creation:", e);
        }

        set({ user: data.user, session: data.session });
      },

      signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        set({ user: null, session: null });
      },

      requestPasswordReset: async (email: string) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) throw error;
      },

      initialize: async () => {
        try {
          // Get current session
          const { data: { session } } = await supabase.auth.getSession();

          // Generate guest ID if not exists
          let currentGuestId = get().guestId;
          if (!currentGuestId) {
            currentGuestId = crypto.randomUUID();
          }

          set({
            user: session?.user || null,
            session: session,
            loading: false,
            guestId: currentGuestId,
          });

          // Listen for auth changes
          supabase.auth.onAuthStateChange((_event, session) => {
            set({
              user: session?.user || null,
              session: session,
            });
          });
        } catch (error) {
          console.error("Auth initialization error:", error);
          set({ loading: false });
        }
      },
    }),
    {
      name: "wadi-auth-storage",
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        guestId: state.guestId,
        guestNick: state.guestNick,
      }),
    }
  )
);
