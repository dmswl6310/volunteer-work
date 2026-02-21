
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const ADMIN_CREDENTIALS = {
    email: 'admin@volunteer.com',
    password: 'admin-password-1234!',
    username: 'admin_official',
    name: '총관리자',
    contact: '010-1234-5678',
    address: '서울특별시 강남구',
    job: '시스템 관리'
};

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
    console.log('==========================================');
    console.log('ID:', ADMIN_CREDENTIALS.email);
    console.log('PW:', ADMIN_CREDENTIALS.password);
    console.log('==========================================');
}

main().catch(console.error);
