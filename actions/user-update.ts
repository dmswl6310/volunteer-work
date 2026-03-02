'use server';

import { createServerSupabaseClient } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

/**
 * 유저 프로필 정보를 수정합니다.
 *
 * @param userId - 수정할 유저 ID
 * @param data - 수정할 데이터 (이름, 연락처, 주소, 직업)
 */
export async function updateUserProfile(userId: string, data: {
    name: string;
    contact: string;
    address: string;
    job: string;
}) {
    try {
        if (!userId) throw new Error('User ID is required');
        const supabase = await createServerSupabaseClient();

        const { error } = await supabase
            .from('users')
            .update({
                name: data.name,
                contact: data.contact,
                address: data.address,
                job: data.job,
            })
            .eq('id', userId);

        if (error) throw error;

        revalidatePath('/mypage');
        revalidatePath('/board');
        return { success: true };
    } catch (error) {
        console.error('Error updating profile:', error);
        throw new Error('프로필 수정 중 오류가 발생했습니다.');
    }
}
