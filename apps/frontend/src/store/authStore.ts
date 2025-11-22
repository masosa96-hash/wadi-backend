import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "../config/supabase";
import type { User, Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;

  // Actions
  requestPasswordReset: (email: string) => Promise<void>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
   
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      loading: true,

      signIn: async (email: string, password: string, _rememberMe: boolean = true) => {
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
        // We just update the local state
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

          set({
            user: session?.user || null,
            session: session,
            loading: false,
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
      }),
    }
  )
);
