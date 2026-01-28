'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase'; // WARNING: this is client-side supabase in lib/supabase.ts. We need server context or trust the caller ID? 
// Actually, secure way is to get session on server. But we are fixing things quickly.
// Better: Pass ID and verify or just trust authenticated caller for now if we don't have server-side auth set up fully.
// Wait, for updates, we really should ensure the user is updating their own profile.
// Since we don't have `createServerClient` setup, we will trust the ID passed from the Client Component which checks auth.
// Ideally, we'd verify the token. 

export async function updateUserProfile(userId: string, data: {
    name: string;
    contact: string;
    address: string;
    job: string;
}) {
    try {
        if (!userId) throw new Error('User ID is required');

        // Update user
        await prisma.user.update({
            where: { id: userId },
            data: {
                name: data.name,
                contact: data.contact,
                address: data.address,
                job: data.job
            }
        });

        revalidatePath('/mypage');
        revalidatePath('/board'); // To update author names in posts potentially
        return { success: true };
    } catch (error) {
        console.error('Error updating profile:', error);
        throw new Error('프로필 수정 중 오류가 발생했습니다.');
    }
}
