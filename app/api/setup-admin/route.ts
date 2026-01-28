
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import prisma from '@/lib/prisma';

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
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

    try {
        // 1. Sign up with Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email: ADMIN_CREDENTIALS.email,
            password: ADMIN_CREDENTIALS.password,
        });

        let userId = data.user?.id;
        let message = 'Admin signup attempted. ';

        if (error) {
            console.error('Supabase Auth Error:', error.message);
            message += `Auth Error: ${error.message}. `;

            // Try login to get ID if already exists
            const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                email: ADMIN_CREDENTIALS.email,
                password: ADMIN_CREDENTIALS.password,
            });

            if (loginData.user) {
                userId = loginData.user.id;
                message += 'Logged in as existing admin. ';
            } else {
                message += 'Could not retrieve ID. ';
            }
        } else {
            message += 'Auth User Created. ';
        }

        if (!userId) {
            return NextResponse.json({ success: false, message });
        }

        // 2. Upsert User in Database (Force Admin Role)
        // Prisma bypasses RLS
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

        return NextResponse.json({
            success: true,
            message,
            user,
            credentials: {
                id: ADMIN_CREDENTIALS.username,
                password: ADMIN_CREDENTIALS.password
            }
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
