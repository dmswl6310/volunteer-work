'use server';

import { createServerSupabaseClient } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function approveUser(userId: string) {
  try {
    const supabase = await createServerSupabaseClient();
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

export async function approveApplication(applicationId: string) {
  try {
    const supabase = await createServerSupabaseClient();

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
  } catch (error: any) {
    console.error('Error approving application:', error);
    throw new Error(error.message || '신청 승인 중 오류가 발생했습니다.');
  }
}

export async function rejectApplication(applicationId: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase
      .from('applications')
      .update({ status: 'rejected' })
      .eq('id', applicationId);

    if (error) throw error;
    revalidatePath('/admin');
  } catch (error) {
    console.error('Error rejecting application:', error);
  }
}

export async function getAdminDashboardData() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('is_approved', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data ?? [];
  } catch (error) {
    console.error('Error fetching admin data:', error);
    return [];
  }
}
