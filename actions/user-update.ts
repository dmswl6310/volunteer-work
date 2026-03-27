'use server';

import { revalidatePath } from 'next/cache';
import { requireApprovedUser } from '@/lib/server-auth';

/**
 * 유저 프로필 정보를 수정합니다.
 *
 * @param data - 수정할 데이터 (연락처, 주소, 직업)
 */
export async function updateUserProfile(data: {
    contact: string;
    address: string;
    job: string;
}) {
    try {
        const { supabase, user } = await requireApprovedUser();

        const { error } = await supabase
            .from('users')
            .update({
                contact: data.contact,
                address: data.address,
                job: data.job,
            })
            .eq('id', user.id);

        if (error) throw error;

        revalidatePath('/mypage');
        revalidatePath('/board');
        return { success: true };
    } catch (error) {
        console.error('Error updating profile:', error);
        throw new Error('프로필 수정 중 오류가 발생했습니다.');
    }
}
