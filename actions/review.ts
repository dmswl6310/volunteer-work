'use server';

import { createServerSupabaseClient } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { checkProfanity } from '@/lib/profanity';
import { requireApprovedUser } from '@/lib/server-auth';
import { getDateKstKey, getTodayKstKey } from '@/lib/date-kst';
import { getPublicProfileMap, getPublicReviewLikeCountMap } from '@/lib/public-data';

type ReviewAuthor = {
  username?: string | null;
};

type ReviewRow = {
  id: string;
  content: string;
  post_id: string;
  author_id: string;
  created_at: string;
  author?: ReviewAuthor | null;
  posts?: {
    id: string;
    title: string | null;
  } | null;
};

async function attachPublicReviewData(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  reviews: ReviewRow[],
  userId?: string
) {
  const reviewIds = reviews.map((review) => review.id);
  const [profiles, likeCounts] = await Promise.all([
    getPublicProfileMap(supabase, reviews.map((review) => review.author_id)),
    getPublicReviewLikeCountMap(supabase, reviewIds),
  ]);

  const likedSet = new Set<string>();
  if (userId && reviewIds.length > 0) {
    const { data: myLikes } = await supabase
      .from('review_likes')
      .select('review_id')
      .eq('user_id', userId)
      .in('review_id', reviewIds);
    (myLikes ?? []).forEach((like) => likedSet.add(like.review_id));
  }

  return reviews.map((review) => ({
    ...review,
    author: profiles.has(review.author_id)
      ? { username: profiles.get(review.author_id)?.username ?? '익명' }
      : null,
    like_count: likeCounts.get(review.id) ?? 0,
    is_liked: likedSet.has(review.id),
  }));
}

/**
 * 봉사활동 후기를 작성합니다.
 * - 욕설 필터링 적용
 * - 실제 참여 확인된 신청자만 작성 가능
 * - 활동 당일부터 작성 가능
 * - 중복 후기 방지
 *
 * @param postId - 게시글 ID
 * @param content - 후기 내용
 */
export async function createReview(postId: string, content: string) {
  // 욕설 필터링 (DB 조회 전 사전 차단)
  if (checkProfanity(content)) {
    return { error: '후기 내용에 부적절한 표현이 포함되어 있습니다.' };
  }

  const { supabase, user } = await requireApprovedUser();

  // 확정된 신청 확인
  const { data: application } = await supabase
    .from('applications')
    .select('*, posts(*)')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!application) {
    return { error: '해당 봉사활동 신청 내역이 없습니다.' };
  }
  if (!application.attended_at) {
    return { error: '주최자가 실제 참여를 확인한 사용자만 후기를 작성할 수 있습니다.' };
  }

  const dueDateKey = getDateKstKey(application.posts?.due_date);
  const todayKey = getTodayKstKey();
  if (dueDateKey && todayKey && dueDateKey > todayKey) {
    return { error: '봉사활동 기간이 종료된 후에만 후기를 작성할 수 있습니다.' };
  }

  // 중복 후기 체크
  const { data: existingReview } = await supabase
    .from('reviews')
    .select('id')
    .eq('post_id', postId)
    .eq('author_id', user.id)
    .maybeSingle();

  if (existingReview) {
    return { error: '이미 이 봉사활동에 대한 후기를 작성하셨습니다.' };
  }

  const { error } = await supabase.from('reviews').insert({
    id: crypto.randomUUID(),
    post_id: postId,
    author_id: user.id,
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
 */
export async function toggleReviewLike(reviewId: string) {
  try {
    const { supabase, user } = await requireApprovedUser();

    const { data: existing } = await supabase
      .from('review_likes')
      .select('id')
      .eq('review_id', reviewId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase.from('review_likes').delete().eq('id', existing.id);
      if (error) throw error;
    } else {
        const { error } = await supabase.from('review_likes').insert({
          id: crypto.randomUUID(),
          review_id: reviewId,
          user_id: user.id,
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
    .select('id, content, post_id, author_id, created_at')
    .eq('post_id', postId)
    .order('created_at', { ascending: false });

  const reviews = (data ?? []) as ReviewRow[];
  return attachPublicReviewData(supabase, reviews, userId);
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
      .select('id, content, post_id, author_id, created_at, posts(title, id)')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    const reviews = (data ?? []) as unknown as ReviewRow[];
    return attachPublicReviewData(supabase, reviews, userId);
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    return [];
  }
}
