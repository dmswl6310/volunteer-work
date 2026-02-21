'use server';

import { createServerSupabaseClient } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function applyForPost(postId: string, userId: string, email?: string) {
  const supabase = await createServerSupabaseClient();

  // 0. 유저 존재 체크 (auto-heal)
  const { data: userExists } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (!userExists) {
    console.warn(`User ${userId} not found in DB during application. Auto-creating...`);
    if (!email) throw new Error('User record missing and no email provided for auto-registration.');

    const emailPrefix = email.split('@')[0];
    let newUsername = emailPrefix;
    let counter = 1;
    while (true) {
      const { data: taken } = await supabase
        .from('users')
        .select('id')
        .eq('username', newUsername)
        .maybeSingle();
      if (!taken) break;
      newUsername = `${emailPrefix}${counter}`;
      counter++;
    }

    await supabase.from('users').insert({
      id: userId,
      email,
      username: newUsername,
      name: 'User',
      contact: '010-0000-0000',
      address: 'Unknown',
      job: 'Unknown',
      role: 'user',
      is_approved: true,
    });
  }

  // 1. 게시글 조회
  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('id', postId)
    .single();

  if (!post || !post.is_recruiting) {
    throw new Error('모집이 종료되었거나 존재하지 않는 게시글입니다.');
  }

  if (post.due_date && new Date(post.due_date) < new Date()) {
    throw new Error('마감 기한이 지났습니다.');
  }

  if (post.current_participants >= post.max_participants) {
    throw new Error('모집 인원이 마감되었습니다.');
  }

  // 2. 중복 신청 체크
  const { data: existingApp } = await supabase
    .from('applications')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existingApp) {
    throw new Error('이미 신청한 봉사활동입니다.');
  }

  // 3. 신청 생성
  const { error } = await supabase.from('applications').insert({
    post_id: postId,
    user_id: userId,
    status: 'pending',
  });

  if (error) {
    console.error(error);
    throw new Error('신청 중 오류가 발생했습니다.');
  }

  revalidatePath(`/board/${postId}`);
}

export async function updateApplicationStatus(applicationId: string, newStatus: 'approved' | 'rejected') {
  const supabase = await createServerSupabaseClient();

  const { data: app } = await supabase
    .from('applications')
    .select('*, posts(*)')
    .eq('id', applicationId)
    .single();

  if (!app) throw new Error('신청 내역을 찾을 수 없습니다.');
  if (app.status === newStatus) return;

  if (newStatus === 'approved' && app.status !== 'approved') {
    const post = app.posts;
    if (post.current_participants >= post.max_participants) {
      throw new Error('모집 인원이 초과되어 승인할 수 없습니다.');
    }
    const { error: postError } = await supabase
      .from('posts')
      .update({ current_participants: post.current_participants + 1 })
      .eq('id', app.post_id);
    if (postError) throw new Error(postError.message);
  }

  const { error } = await supabase
    .from('applications')
    .update({ status: newStatus })
    .eq('id', applicationId);

  if (error) throw new Error(error.message || '상태 변경 중 오류가 발생했습니다.');

  revalidatePath('/mypage');
}

export async function cancelApplication(applicationId: string) {
  const supabase = await createServerSupabaseClient();

  const { data: app } = await supabase
    .from('applications')
    .select('*, posts(*)')
    .eq('id', applicationId)
    .single();

  if (!app) throw new Error('신청 내역을 찾을 수 없습니다.');

  if (app.status === 'approved' || app.status === 'confirmed') {
    const post = app.posts;
    await supabase
      .from('posts')
      .update({ current_participants: Math.max(0, post.current_participants - 1) })
      .eq('id', app.post_id);
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
