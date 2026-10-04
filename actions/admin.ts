'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminUser } from '@/lib/server-auth';

export type PendingAdminUser = {
  id: string;
  email: string;
  username: string | null;
  contact: string | null;
  address: string | null;
  job: string | null;
  created_at: string;
};

/**
 * 신규 가입 유저를 승인합니다.
 * @param userId - 승인할 유저 ID
 */
export async function approveUser(userId: string) {
  try {
    const { supabase } = await requireAdminUser();
    const { error } = await supabase.rpc('approve_user', { target_user_id: userId });

    if (error) throw error;
    revalidatePath('/admin');
  } catch (error) {
    console.error('Error approving user:', error);
    throw new Error('사용자 승인 중 오류가 발생했습니다.');
  }
}

/**
 * 관리자 대시보드에 표시할 미승인 유저 목록을 조회합니다.
 * @returns 미승인 유저 배열
 */
export async function getAdminDashboardData() {
  try {
    const { supabase } = await requireAdminUser();
    const pendingUsersRes = await supabase
      .from('users')
      .select('id, email, username, contact, address, job, created_at')
      .eq('is_approved', false)
      .order('created_at', { ascending: false });

    if (pendingUsersRes.error) throw pendingUsersRes.error;

    return {
      pendingUsers: (pendingUsersRes.data ?? []) as PendingAdminUser[],
    };
  } catch (error) {
    console.error('Error fetching admin data:', error);
    return { pendingUsers: [] };
  }
}
