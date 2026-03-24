
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function requireEnv(name: string, value: string | undefined) {
    if (!value) {
        throw new Error(`Missing required admin bootstrap env: ${name}`);
    }

    return value;
}

const ADMIN_CREDENTIALS = {
    email: requireEnv('ADMIN_EMAIL', process.env.ADMIN_EMAIL),
    password: requireEnv('ADMIN_PASSWORD', process.env.ADMIN_PASSWORD),
    username: requireEnv('ADMIN_USERNAME', process.env.ADMIN_USERNAME),
    name: requireEnv('ADMIN_NAME', process.env.ADMIN_NAME),
    contact: requireEnv('ADMIN_CONTACT', process.env.ADMIN_CONTACT),
    address: requireEnv('ADMIN_ADDRESS', process.env.ADMIN_ADDRESS),
    job: requireEnv('ADMIN_JOB', process.env.ADMIN_JOB),
};

if (!supabaseUrl || !supabaseKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('Creating Admin Account...');

    const { data, error } = await supabase.auth.signUp({
        email: ADMIN_CREDENTIALS.email,
        password: ADMIN_CREDENTIALS.password,
    });

    if (error) {
        console.error('Supabase Auth Error:', error.message);
    }

    let userId = data.user?.id;

    if (!userId) {
        console.log('Could not get new user ID from signup (maybe already exists?)');
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: ADMIN_CREDENTIALS.email,
            password: ADMIN_CREDENTIALS.password,
        });

        if (loginError) {
            console.error('Login failed too:', loginError.message);
            return;
        }
        userId = loginData.user.id;
    }

    console.log(`User ID: ${userId}`);

    const { data: user, error: upsertError } = await supabase
        .from('users')
        .upsert({
            id: userId,
            email: ADMIN_CREDENTIALS.email,
            username: ADMIN_CREDENTIALS.username,
            name: ADMIN_CREDENTIALS.name,
            contact: ADMIN_CREDENTIALS.contact,
            address: ADMIN_CREDENTIALS.address,
            job: ADMIN_CREDENTIALS.job,
            role: 'admin',
            is_approved: true,
        }, { onConflict: 'email' })
        .select()
        .single();

    if (upsertError) {
        console.error('DB Error:', upsertError.message);
        return;
    }

    console.log('Admin user configured in Database:', user);
    console.log('Admin bootstrap completed using environment variables.');
}

main().catch(console.error);
