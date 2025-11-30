import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') }); // Adjust path to root .env
import { supabase } from "../config/supabase";

async function checkSchema() {
    console.log("Checking schema for 'conversations' table...");

    // We can't query information_schema directly with supabase-js easily due to permissions usually,
    // but we can try to select * from conversations limit 1 and see the keys in the returned object,
    // or use an RPC if we had one.
    // Actually, let's try to insert a dummy record and catch the error, or just select.

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
            console.log("No rows found. Trying to infer columns from error on invalid select...");
            const { error: selectError } = await supabase
                .from('conversations')
                .select('user_id, id, created_at')
                .limit(1);

            if (selectError) {
                console.error("Select specific columns error:", selectError);
            } else {
                console.log("Select user_id, id, created_at succeeded.");
            }
        }
    }
}

checkSchema();
