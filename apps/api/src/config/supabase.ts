import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    "Missing Supabase environment variables. App running in SAFE MODE. Supabase features will fail."
  );
}

export const supabase = createClient(supabaseUrl || "", supabaseKey || "");

// Health check function to verify Supabase connection
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from("profiles").select("user_id").limit(1);
    if (error && error.code !== "PGRST116") {
      // PGRST116 is "no rows returned" which is fine
      console.error("Supabase connection check failed:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Supabase connection error:", err);
    return false;
  }
}
