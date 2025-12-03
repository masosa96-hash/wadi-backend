import { createClient } from '@supabase/supabase-js';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log("Checking schema for 'conversations' table...");

    const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .limit(1);

    if (error) {
        console.error("Error querying conversations:", error);
    } else {
        console.log("Conversations sample:", data);
        if (data && data.length > 0) {
            console.log("Columns:", Object.keys(data[0]));
        } else {
            console.log("No rows found. Trying to select specific columns...");
            const { error: selectError } = await supabase
                .from('conversations')
                .select('user_id')
                .limit(1);

            if (selectError) {
                console.error("Select user_id error:", selectError);
            } else {
                console.log("Select user_id succeeded.");
            }
        }
    }
}

checkSchema();
