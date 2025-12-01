const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRpc() {
    console.log("Checking RPC 'get_or_create_default_conversation'...");

    // Use a random UUID for testing
    const testUserId = '00000000-0000-0000-0000-000000000000';

    const { data, error } = await supabase
        .rpc('get_or_create_default_conversation', { p_user_id: testUserId });

    if (error) {
        console.error("RPC Error:", error);
    } else {
        console.log("RPC Success! Conversation ID:", data);
    }
}

checkRpc();
