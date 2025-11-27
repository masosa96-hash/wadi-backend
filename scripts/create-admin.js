const { createClient } = require('../apps/api/node_modules/@supabase/supabase-js');

const SUPABASE_URL = 'https://smkbiguvgiscojwxgbae.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNta2JpZ3V2Z2lzY29qd3hnYmFlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQxMTgyMywiZXhwIjoyMDc4OTg3ODIzfQ.uDFNhOGqGb4kv3DWcVHdRoPjCSUhL_IJURaTRtqJZNE';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createAdminUser() {
    const email = 'admin@wadi.ai';
    const password = 'password123';

    console.log(`Creating user: ${email}...`);

    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: 'Admin User' }
    });

    if (error) {
        console.error('Error creating user:', error.message);
        return;
    }

    console.log('User created successfully!');
    console.log('ID:', data.user.id);
    console.log('Email:', data.user.email);
    console.log('Password:', password);
}

createAdminUser();
