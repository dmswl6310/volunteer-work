'use server';

import { createServerSupabaseClient } from '@/lib/supabase';
import { requireApprovedUser } from '@/lib/server-auth';

import {
  deriveActiveApplications,
  deriveAttendancePosts,
  deriveCompletedActivities,
  deriveIncomingRequests,
  normalizeHostingPosts,
  type MyPageApplication,
  type MyPageApplicationsData,
  type MyPageHistoryData,
  type MyPageHostingData,
  type MyPageOverviewData,
  type MyPagePointsData,
  type MyPageProfile,
  type MyPageReview,
  type MyPageScrap,
  type MyPointTransaction,
} from '@/actions/user-mypage';

export type {
  MyPageApplication,
  MyPageApplicationsData,
  MyPageHistoryData,
  MyPageHostingData,
  MyPageHostingPost,
  MyPageOverviewData,
  MyPagePointsData,
  MyPageProfile,
  MyPageReview,
  MyPageScrap,
  MyPointTransaction,
} from '@/actions/user-mypage';

async function getMyPageProfile() {
  const { supabase, user: authUser } = await requireApprovedUser();
  const { data: profile } = await supabase
    .from('users')
    .select('id, username, points, role, contact, address, job')
    .eq('id', authUser.id)
    .maybeSingle<MyPageProfile>();

  if (!profile) {
    throw new Error('사용자 정보를 찾을 수 없습니다.');
  }

  return { supabase, authUser, profile };
}


export async function getMyPageOverviewData(): Promise<MyPageOverviewData> {
  const { supabase, authUser, profile } = await getMyPageProfile();

  const [applicationsRes, postsRes, scrapsRes, reviewsRes] = await Promise.all([
    supabase
      .from('applications')
      .select('id, status, post_id, created_at, attended_at, points_awarded_at, posts(id, title, due_date, volunteer_hours)')
      .eq('user_id', authUser.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('posts')
      .select('id, title, due_date, volunteer_hours, current_participants, max_participants, is_recruiting, applications(id, status, created_at, attended_at, points_awarded_at, users(username, contact, email, job, address))')
      .eq('author_id', authUser.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('post_scraps')
      .select('id')
      .eq('user_id', authUser.id),
    supabase
      .from('reviews')
      .select('id')
      .eq('author_id', authUser.id),
  ]);

  const applications = (applicationsRes.data ?? []) as MyPageApplication[];
  const hostedPosts = normalizeHostingPosts((postsRes.data ?? []) as Array<Record<string, unknown>>);
  const incomingRequests = deriveIncomingRequests(hostedPosts);
  const attendancePosts = deriveAttendancePosts(hostedPosts);
  const activeApplications = deriveActiveApplications(applications);
  const completedActivities = deriveCompletedActivities(applications);

  return {
    profile,
    counts: {
      pendingIncomingRequests: incomingRequests.length,
      pendingApplications: activeApplications.filter((application) => application.status === 'pending').length,
      attendanceActions: attendancePosts.length,
      completedActivities: completedActivities.length,
      hostedPosts: hostedPosts.length,
      scraps: scrapsRes.data?.length ?? 0,
      reviews: reviewsRes.data?.length ?? 0,
    },
    previews: {
      incomingRequests: incomingRequests.slice(0, 3),
      applications: activeApplications.slice(0, 3),
      attendancePosts: attendancePosts.slice(0, 3),
      completedActivities: completedActivities.slice(0, 3),
    },
  };
}

export async function getMyApplicationsPageData(): Promise<MyPageApplicationsData> {
  const { supabase, authUser, profile } = await getMyPageProfile();

  const { data } = await supabase
    .from('applications')
    .select('id, status, post_id, created_at, attended_at, points_awarded_at, posts(id, title, due_date, volunteer_hours)')
    .eq('user_id', authUser.id)
    .order('created_at', { ascending: false });

  const applications = (data ?? []) as MyPageApplication[];

  return {
    profile,
    activeApplications: deriveActiveApplications(applications),
    completedActivities: deriveCompletedActivities(applications),
  };
}

export async function getMyHostingPageData(): Promise<MyPageHostingData> {
  const { supabase, authUser, profile } = await getMyPageProfile();

  const { data } = await supabase
    .from('posts')
    .select('id, title, due_date, volunteer_hours, current_participants, max_participants, is_recruiting, applications(id, status, created_at, attended_at, points_awarded_at, users(username, contact, email, job, address))')
    .eq('author_id', authUser.id)
    .order('created_at', { ascending: false });

  const hostedPosts = normalizeHostingPosts((data ?? []) as Array<Record<string, unknown>>);

  return {
    profile,
    incomingRequests: deriveIncomingRequests(hostedPosts),
    attendancePosts: deriveAttendancePosts(hostedPosts),
    hostedPosts,
  };
}

export async function getMyHistoryPageData({
  completedLimit = 12,
  scrapLimit = 12,
  reviewLimit = 12,
}: {
  completedLimit?: number;
  scrapLimit?: number;
  reviewLimit?: number;
} = {}): Promise<MyPageHistoryData> {
  const { supabase, authUser, profile } = await getMyPageProfile();

  const [applicationsRes, scrapsRes, reviewsRes] = await Promise.all([
    supabase
      .from('applications')
      .select('id, status, post_id, created_at, attended_at, points_awarded_at, posts(id, title, due_date, volunteer_hours)')
      .eq('user_id', authUser.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('post_scraps')
      .select('id, post_id, created_at, posts(id, title)')
      .eq('user_id', authUser.id)
      .order('created_at', { ascending: false })
      .range(0, scrapLimit - 1),
    supabase
      .from('reviews')
      .select('id, content, created_at, posts(title, id)')
      .eq('author_id', authUser.id)
      .order('created_at', { ascending: false })
      .range(0, reviewLimit - 1),
  ]);

  return {
    profile,
    completedActivities: deriveCompletedActivities((applicationsRes.data ?? []) as MyPageApplication[]).slice(0, completedLimit),
    scraps: (scrapsRes.data ?? []) as MyPageScrap[],
    reviews: (reviewsRes.data ?? []) as MyPageReview[],
  };
}

export async function getMyPointsPageData(limit = 20): Promise<MyPagePointsData> {
  const { supabase, authUser, profile } = await getMyPageProfile();

  const { data, error } = await supabase
    .from('point_transactions')
    .select('id, points, transaction_type, description, created_at, post_id')
    .eq('user_id', authUser.id)
    .order('created_at', { ascending: false })
    .range(0, limit - 1);

  if (error) {
    throw new Error(error.message || '포인트 내역을 불러오지 못했습니다.');
  }

  const pointTransactions = (data ?? []) as MyPointTransaction[];
  const postIds = Array.from(new Set(pointTransactions.map((transaction) => transaction.post_id).filter(Boolean))) as string[];

  let postTitleMap = new Map<string, { id: string; title: string | null }>();

  if (postIds.length > 0) {
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('id, title')
      .in('id', postIds);

    if (postsError) {
      throw new Error(postsError.message || '포인트 내역에 연결된 게시글 정보를 불러오지 못했습니다.');
    }

    postTitleMap = new Map((postsData ?? []).map((post) => [post.id, { id: post.id, title: post.title }]));
  }

  return {
    profile,
    pointTransactions: pointTransactions.map((transaction) => ({
      ...transaction,
      posts: transaction.post_id ? postTitleMap.get(transaction.post_id) ?? null : null,
    })),
  };
}

export async function getMyProfileData() {
  const { profile } = await getMyPageProfile();
  return profile;
}

/**
 * 유저의 관리자 승인 상태를 확인합니다.
 * @param userId - 확인할 유저 ID
 * @returns 승인 여부와 역할 정보
 */
export async function checkUserApproval(userId: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: user, error } = await supabase
      .from('users')
      .select('is_approved, role')
      .eq('id', userId)
      .maybeSingle();

    if (error || !user) {
      return { success: false, error: 'User not found' };
    }

    return { success: true, isApproved: user.is_approved, role: user.role };
  } catch (error) {
    console.error('Error checking user approval:', error);
    return { success: false, error: 'Failed to check user status' };
  }
}
