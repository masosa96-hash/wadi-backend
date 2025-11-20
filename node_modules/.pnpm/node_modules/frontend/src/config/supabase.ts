import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Configure session persistence
    // 'local' = persist session in localStorage (survives browser restarts)
    // 'session' = persist in sessionStorage (cleared when browser closes)
    // This will be controlled dynamically by the "Remember me" checkbox
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
