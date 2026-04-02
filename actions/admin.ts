'use server';

import { revalidatePath } from 'next/cache';
import { updateApplicationStatus } from '@/actions/apply';
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

export type PendingAdminApplication = {
  id: string;
  created_at: string;
  status: string;
  users: {
    username: string | null;
    contact: string | null;
    email: string | null;
    job: string | null;
    address: string | null;
  } | null;
  post: {
    id: string;
    title: string;
    current_participants: number | null;
    max_participants: number | null;
  } | null;
};

/**
 * 신규 가입 유저를 승인합니다.
 * @param userId - 승인할 유저 ID
 */
export async function approveUser(userId: string) {
  try {
    const { supabase } = await requireAdminUser();
    const { error } = await supabase
      .from('users')
      .update({ is_approved: true })
      .eq('id', userId);

    if (error) throw error;
    revalidatePath('/admin');
  } catch (error) {
    console.error('Error approving user:', error);
    throw new Error('사용자 승인 중 오류가 발생했습니다.');
  }
}

/**
 * 봉사활동 신청을 승인합니다.
 * 모집 인원 초과 시 에러를 발생시킵니다.
 * @param applicationId - 승인할 신청 ID
 */
export async function approveApplication(applicationId: string) {
  await requireAdminUser();
  return updateApplicationStatus(applicationId, 'approved');
}

/**
 * 봉사활동 신청을 거절합니다.
 * @param applicationId - 거절할 신청 ID
 */
export async function rejectApplication(applicationId: string) {
  await requireAdminUser();
  return updateApplicationStatus(applicationId, 'rejected');
}

/**
 * 관리자 대시보드에 표시할 미승인 유저 목록을 조회합니다.
 * @returns 미승인 유저 배열
 */
export async function getAdminDashboardData() {
  try {
    const { supabase } = await requireAdminUser();
    const [pendingUsersRes, pendingApplicationsRes] = await Promise.all([
      supabase
        .from('users')
        .select('id, email, username, contact, address, job, created_at')
        .eq('is_approved', false)
        .order('created_at', { ascending: false }),
      supabase
        .from('applications')
        .select('id, created_at, status, users(username, contact, email, job, address), post:posts(id, title, current_participants, max_participants)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false }),
    ]);

    if (pendingUsersRes.error) throw pendingUsersRes.error;
    if (pendingApplicationsRes.error) throw pendingApplicationsRes.error;

    return {
      pendingUsers: (pendingUsersRes.data ?? []) as PendingAdminUser[],
      pendingApplications: (pendingApplicationsRes.data ?? []).map((application) => ({
        id: application.id,
        created_at: application.created_at,
        status: application.status,
        users: Array.isArray(application.users) ? (application.users[0] ?? null) : application.users,
        post: Array.isArray(application.post) ? (application.post[0] ?? null) : application.post,
      })) as PendingAdminApplication[],
    };
  } catch (error) {
    console.error('Error fetching admin data:', error);
    return { pendingUsers: [], pendingApplications: [] };
  }
}
