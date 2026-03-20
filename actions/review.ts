'use server';

import { createServerSupabaseClient } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { checkProfanity } from '@/lib/profanity';

/**
 * 봉사활동 후기를 작성합니다.
 * - 욕설 필터링 적용
 * - 승인된 신청자만 작성 가능
 * - 활동 종료 후에만 작성 가능
 * - 중복 후기 방지
 *
 * @param postId - 게시글 ID
 * @param userId - 작성자 ID
 * @param content - 후기 내용
 */
export async function createReview(postId: string, userId: string, content: string) {
  // 욕설 필터링 (DB 조회 전 사전 차단)
  if (checkProfanity(content)) {
    return { error: '후기 내용에 부적절한 표현이 포함되어 있습니다.' };
  }

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

/**
 * 후기 좋아요를 토글합니다. (좋아요/좋아요 취소)
 * @param reviewId - 후기 ID
 * @param userId - 유저 ID
 */
export async function toggleReviewLike(reviewId: string, userId: string) {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: existing } = await supabase
      .from('review_likes')
      .select('id')
      .eq('review_id', reviewId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase.from('review_likes').delete().eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('review_likes').insert({
        id: crypto.randomUUID(),
        review_id: reviewId,
        user_id: userId,
      });
      if (error) throw error;
    }

    // 후기가 속한 게시글 페이지도 함께 캐시 갱신
    const { data: review } = await supabase
      .from('reviews')
      .select('post_id')
      .eq('id', reviewId)
      .single();

    if (review) {
      revalidatePath(`/board/${review.post_id}`);
    }
    revalidatePath('/reviews');
  } catch (error) {
    console.error('Error toggling review like:', error);
    throw new Error('좋아요 처리 중 오류가 발생했습니다.');
  }
}

/**
 * 특정 게시글의 후기 목록을 조회합니다. (좋아요 수 포함)
 * @param postId - 게시글 ID
 * @param userId - 현재 로그인한 유저 ID (좋아요 여부 확인용, 선택)
 * @returns 후기 배열
 */
export async function getReviews(postId: string, userId?: string) {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from('reviews')
    .select('*, author:users(name, email, username), review_likes(count)')
    .eq('post_id', postId)
    .order('created_at', { ascending: false });

  const reviews = data ?? [];

  // 현재 유저의 좋아요 여부를 각 후기에 추가
  if (userId && reviews.length > 0) {
    const { data: myLikes } = await supabase
      .from('review_likes')
      .select('review_id')
      .eq('user_id', userId)
      .in('review_id', reviews.map((r: any) => r.id));

    const likedSet = new Set((myLikes ?? []).map((l: any) => l.review_id));
    return reviews.map((review: any) => ({
      ...review,
      like_count: review.review_likes?.[0]?.count ?? 0,
      is_liked: likedSet.has(review.id),
    }));
  }

  return reviews.map((review: any) => ({
    ...review,
    like_count: review.review_likes?.[0]?.count ?? 0,
    is_liked: false,
  }));
}

/**
 * 전체 후기 목록을 최신순으로 조회합니다. (최대 20건, 좋아요 수 포함)
 * @param userId - 현재 로그인한 유저 ID (좋아요 여부 확인용, 선택)
 * @returns 후기 배열
 */
export async function getAllReviews(userId?: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('reviews')
      .select('*, author:users(name), posts(title, id), review_likes(count)')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    const reviews = data ?? [];

    if (userId && reviews.length > 0) {
      const { data: myLikes } = await supabase
        .from('review_likes')
        .select('review_id')
        .eq('user_id', userId)
        .in('review_id', reviews.map((r: any) => r.id));

      const likedSet = new Set((myLikes ?? []).map((l: any) => l.review_id));
      return reviews.map((review: any) => ({
        ...review,
        like_count: review.review_likes?.[0]?.count ?? 0,
        is_liked: likedSet.has(review.id),
      }));
    }

    return reviews.map((review: any) => ({
      ...review,
      like_count: review.review_likes?.[0]?.count ?? 0,
      is_liked: false,
    }));
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    return [];
  }
}
