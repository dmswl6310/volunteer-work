'use server';

import { createServerSupabaseClient } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function createReview(postId: string, userId: string, content: string) {
  const supabase = await createServerSupabaseClient();

  // 확정된 신청 확인
  const { data: application } = await supabase
    .from('applications')
    .select('*, posts(*)')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle();

  if (!application) {
    return { error: '해당 봉사활동 신청 내역이 없습니다.' };
  }
  if (application.status !== 'approved' && application.status !== 'confirmed') {
    return { error: '주최자에게 참여 승인을 받은 사용자만 후기를 작성할 수 있습니다.' };
  }

  const dueDate = application.posts?.due_date ? new Date(application.posts.due_date) : null;
  if (dueDate && dueDate > new Date()) {
    return { error: '봉사활동 기간이 종료된 후에만 후기를 작성할 수 있습니다.' };
  }

  // 중복 후기 체크
  const { data: existingReview } = await supabase
    .from('reviews')
    .select('id')
    .eq('post_id', postId)
    .eq('author_id', userId)
    .maybeSingle();

  if (existingReview) {
    return { error: '이미 이 봉사활동에 대한 후기를 작성하셨습니다.' };
  }

  const { error } = await supabase.from('reviews').insert({
    id: crypto.randomUUID(),
    post_id: postId,
    author_id: userId,
    content,
  });

  if (error) {
    console.error('Error creating review:', error);
    return { error: '후기 작성 중 오류가 발생했습니다.' };
  }

  revalidatePath(`/board/${postId}`);
  return { success: true };
}

export async function getReviews(postId: string) {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from('reviews')
    .select('*, author:users(name, email, username)')
    .eq('post_id', postId)
    .order('created_at', { ascending: false });

  return data ?? [];
}

export async function getAllReviews() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('reviews')
      .select('*, author:users(name), posts(title, id)')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data ?? [];
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    return [];
  }
}
