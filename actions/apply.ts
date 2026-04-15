'use server';

import { revalidatePath } from 'next/cache';
import { requireApprovedUser } from '@/lib/server-auth';

async function syncApprovedParticipantCount(supabase: Awaited<ReturnType<typeof requireApprovedUser>>['supabase'], postId: string) {
  const { count, error: countError } = await supabase
    .from('applications')
    .select('id', { count: 'exact', head: true })
    .eq('post_id', postId)
    .eq('status', 'approved');

  if (countError) {
    throw new Error(countError.message || '승인 인원 수를 다시 계산하지 못했습니다.');
  }

  const approvedCount = count ?? 0;
  const { error: updateError } = await supabase
    .from('posts')
    .update({ current_participants: approvedCount })
    .eq('id', postId);

  if (updateError) {
    throw new Error(updateError.message || '참여 인원 동기화 중 오류가 발생했습니다.');
  }

  return approvedCount;
}

/**
 * 봉사활동 게시글에 참여 신청을 합니다.
 * - 유저 존재 여부 확인 (없으면 자동 생성)
 * - 게시글 모집 상태/마감일/인원 검증
 * - 중복 신청 방지
 *
 * @param postId - 신청할 게시글 ID
 */
export async function applyForPost(postId: string) {
  const { supabase, user } = await requireApprovedUser();

  // 1. 게시글 조회
  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('id', postId)
    .single();

  if (!post || !post.is_recruiting) {
    throw new Error('모집이 종료되었거나 존재하지 않는 게시글입니다.');
  }

  if (post.due_date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(post.due_date);
    dueDate.setHours(0, 0, 0, 0);
    if (dueDate < today) {
      throw new Error('모집 마감 기한이 지났습니다.');
    }
  }

  if (post.current_participants >= post.max_participants) {
    throw new Error('모집 인원이 마감되었습니다.');
  }

  // 2. 중복 신청 체크
  const { data: existingApp } = await supabase
    .from('applications')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existingApp) {
    throw new Error('이미 신청한 봉사활동입니다.');
  }

  // 3. 신청 생성
  const { error } = await supabase.from('applications').insert({
    id: crypto.randomUUID(),
    post_id: postId,
    user_id: user.id,
    status: 'pending',
  });

  if (error) {
    console.error(error);
    throw new Error('신청 중 오류가 발생했습니다.');
  }

  revalidatePath(`/board/${postId}`);
}

/**
 * 봉사활동 신청의 상태를 변경합니다. (승인/거절)
 * 승인 시 게시글의 참여자 수를 증가시킵니다.
 *
 * @param applicationId - 신청 ID
 * @param newStatus - 변경할 상태 ('approved' | 'rejected')
 */
export async function updateApplicationStatus(applicationId: string, newStatus: 'approved' | 'rejected') {
  const { supabase, user, profile } = await requireApprovedUser();

  const { data: app } = await supabase
    .from('applications')
    .select('id, status, post_id, user_id, posts(author_id, current_participants, max_participants)')
    .eq('id', applicationId)
    .single();

  if (!app) throw new Error('신청 내역을 찾을 수 없습니다.');
  const post = Array.isArray(app.posts) ? app.posts[0] : app.posts;
  if (!post) throw new Error('게시글 정보를 찾을 수 없습니다.');
  if (profile.role !== 'admin' && post.author_id !== user.id) {
    throw new Error('상태를 변경할 권한이 없습니다.');
  }
  if (app.status === newStatus) return;

  if (newStatus === 'approved') {
    const { count: approvedCount, error: approvedCountError } = await supabase
      .from('applications')
      .select('id', { count: 'exact', head: true })
      .eq('post_id', app.post_id)
      .eq('status', 'approved');

    if (approvedCountError) {
      throw new Error(approvedCountError.message || '승인 현황을 확인하지 못했습니다.');
    }

    if ((approvedCount ?? post.current_participants) >= post.max_participants) {
      throw new Error('모집 인원이 초과되어 승인할 수 없습니다.');
    }
  }

  const { error } = await supabase
    .from('applications')
    .update({ status: newStatus })
    .eq('id', applicationId);

  if (error) throw new Error(error.message || '상태 변경 중 오류가 발생했습니다.');

  await syncApprovedParticipantCount(supabase, app.post_id);

  revalidatePath('/mypage');
  revalidatePath('/mypage/hosting');
  revalidatePath('/admin');
  revalidatePath(`/board/${app.post_id}`);
}

export async function rejectRemainingApplications(postId: string) {
  const { supabase, user, profile } = await requireApprovedUser();

  const { data: post } = await supabase
    .from('posts')
    .select('id, author_id')
    .eq('id', postId)
    .single();

  if (!post) {
    throw new Error('게시글 정보를 찾을 수 없습니다.');
  }

  if (profile.role !== 'admin' && post.author_id !== user.id) {
    throw new Error('남은 신청을 정리할 권한이 없습니다.');
  }

  const { data, error } = await supabase
    .from('applications')
    .update({ status: 'rejected' })
    .eq('post_id', postId)
    .eq('status', 'pending')
    .select('id');

  if (error) {
    throw new Error(error.message || '남은 신청 거절 처리 중 오류가 발생했습니다.');
  }

  const rejectedCount = data?.length ?? 0;

  revalidatePath('/mypage');
  revalidatePath('/mypage/hosting');
  revalidatePath('/admin');
  revalidatePath(`/board/${postId}`);

  return { rejectedCount };
}

/**
 * 봉사활동 신청을 취소합니다.
 * 이미 승인/확정된 신청이면 참여자 수를 감소시킵니다.
 *
 * @param applicationId - 취소할 신청 ID
 */
export async function cancelApplication(applicationId: string) {
  const { supabase, user } = await requireApprovedUser();

  const { data: app } = await supabase
    .from('applications')
    .select('id, status, post_id, user_id')
    .eq('id', applicationId)
    .single();

  if (!app) throw new Error('신청 내역을 찾을 수 없습니다.');

  if (app.user_id !== user.id) {
    throw new Error('본인 신청만 취소할 수 있습니다.');
  }

  if (app.status !== 'pending') {
    throw new Error('승인 대기 상태의 신청만 취소할 수 있습니다.');
  }

  const { error } = await supabase
    .from('applications')
    .delete()
    .eq('id', applicationId);

  if (error) {
    console.error(error);
    throw new Error('취소 처리 중 오류가 발생했습니다.');
  }

  revalidatePath('/mypage');
  revalidatePath(`/board/${app.post_id}`);
}
