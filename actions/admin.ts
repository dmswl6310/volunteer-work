'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminUser } from '@/lib/server-auth';

export type PendingAdminUser = {
  id: string;
  email: string;
  username: string | null;
  name: string | null;
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
    name: string | null;
    username: string | null;
    contact: string | null;
    email: string | null;
    job: string | null;
    address: string | null;
  } | null;
  post: {
    id: string;
    title: string;
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
  try {
    const { supabase } = await requireAdminUser();

    // 신청 정보 조회
    const { data: app, error: fetchError } = await supabase
      .from('applications')
      .select('*, posts(*)')
      .eq('id', applicationId)
      .single();

    if (fetchError || !app) throw new Error('신청 내역을 찾을 수 없습니다.');

    const post = app.posts;
    if (post.current_participants >= post.max_participants) {
      throw new Error('모집 인원이 초과되었습니다.');
    }

    // 신청 상태 변경
    const { error: appError } = await supabase
      .from('applications')
      .update({ status: 'approved' })
      .eq('id', applicationId);
    if (appError) throw appError;

    // 참여자 수 증가
    const { error: postError } = await supabase
      .from('posts')
      .update({ current_participants: post.current_participants + 1 })
      .eq('id', app.post_id);
    if (postError) throw postError;

    revalidatePath('/admin');
  } catch (error: unknown) {
    console.error('Error approving application:', error);
    throw new Error(error instanceof Error ? error.message : '신청 승인 중 오류가 발생했습니다.');
  }
}

/**
 * 봉사활동 신청을 거절합니다.
 * @param applicationId - 거절할 신청 ID
 */
export async function rejectApplication(applicationId: string) {
  try {
    const { supabase } = await requireAdminUser();
    const { error } = await supabase
      .from('applications')
      .update({ status: 'rejected' })
      .eq('id', applicationId);

    if (error) throw error;
    revalidatePath('/admin');
  } catch (error) {
    console.error('Error rejecting application:', error);
    throw new Error('신청 거절 중 오류가 발생했습니다.');
  }
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
        .select('id, email, username, name, contact, address, job, created_at')
        .eq('is_approved', false)
        .order('created_at', { ascending: false }),
      supabase
        .from('applications')
        .select('id, created_at, status, users(name, username, contact, email, job, address), post:posts(id, title)')
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
