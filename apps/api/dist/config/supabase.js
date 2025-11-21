"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
exports.checkSupabaseConnection = checkSupabaseConnection;
const supabase_js_1 = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables. Please check SUPABASE_URL and SUPABASE_ANON_KEY in the .env file at monorepo root (E:\\WADI intento mil\\.env)");
}
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
// Health check function to verify Supabase connection
async function checkSupabaseConnection() {
    try {
        const { error } = await exports.supabase.from("profiles").select("user_id").limit(1);
        if (error && error.code !== "PGRST116") {
            // PGRST116 is "no rows returned" which is fine
            console.error("Supabase connection check failed:", error.message);
            return false;
        }
        return true;
    }
    catch (err) {
        console.error("Supabase connection error:", err);
        return false;
    }
}
