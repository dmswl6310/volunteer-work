
import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
// Note: In a real backend, we'd use the service_role key to bypass RLS, 
// but for this script we can try signup (which is public) then Prisma (which is admin).

const supabase = createClient(supabaseUrl, supabaseKey);
const prisma = new PrismaClient();

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

    // 1. Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
        email: ADMIN_CREDENTIALS.email,
        password: ADMIN_CREDENTIALS.password,
    });

    if (error) {
        console.error('Supabase Auth Error:', error.message);
        // If user already exists, we might still want to promote them.
        // But we don't have their ID unless we login. 
        // Let's assume for this script we want to create fresh or handle "User already registered" by logging in?
        // Actually, if they exist in Auth, we can't get their ID easily without login.
        // Let's try to proceed to Prisma check if email exists.
    }

    let userId = data.user?.id;

    if (!userId) {
        console.log('Could not get new user ID from signup (maybe already exists? or email verify needed?)');
        // Attempt login to get ID if signup failed due to existing user
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

    // 2. Upsert User in Database (Force Admin Role)
    // We use Prisma to bypass RLS
    const user = await prisma.user.upsert({
        where: { email: ADMIN_CREDENTIALS.email },
        update: {
            role: 'admin',
            isApproved: true,
        },
        create: {
            id: userId,
            email: ADMIN_CREDENTIALS.email,
            username: ADMIN_CREDENTIALS.username,
            name: ADMIN_CREDENTIALS.name,
            contact: ADMIN_CREDENTIALS.contact,
            address: ADMIN_CREDENTIALS.address,
            job: ADMIN_CREDENTIALS.job,
            role: 'admin',
            isApproved: true,
        },
    });

    console.log('Admin user configured in Database:', user);
    console.log('==========================================');
    console.log('ID:', ADMIN_CREDENTIALS.email);
    console.log('PW:', ADMIN_CREDENTIALS.password);
    console.log('==========================================');
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
