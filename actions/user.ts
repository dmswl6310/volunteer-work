'use server';

import { createServerSupabaseClient } from '@/lib/supabase';
import { requireApprovedUser } from '@/lib/server-auth';

export type MyPageProfile = {
  id: string;
  username: string;
  points: number;
  role: string | null;
  contact: string | null;
  address: string | null;
  job: string | null;
};

export type MyPageIncomingRequest = {
  id: string;
  status: string;
  created_at: string;
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
    current_participants?: number;
    max_participants?: number;
  };
};

export type MyPageApplication = {
  id: string;
  status: string;
  post_id?: string;
  postId?: string;
  created_at?: string;
  createdAt?: string;
  attended_at?: string | null;
  points_awarded_at?: string | null;
  posts?: {
    id?: string;
    title?: string | null;
    due_date?: string | null;
    volunteer_hours?: number | null;
  } | null;
};

export type MyPageHostingPost = {
  id: string;
  title: string;
  due_date?: string | null;
  volunteer_hours?: number | null;
  current_participants: number;
  max_participants: number;
  is_recruiting: boolean;
  applications: Array<{
    id: string;
    status: string;
    created_at?: string;
    attended_at?: string | null;
    points_awarded_at?: string | null;
    users: {
      username: string | null;
      contact: string | null;
      email: string | null;
      job: string | null;
      address: string | null;
    } | null;
  }>;
};

export type MyPageScrap = {
  id: string;
  post_id?: string;
  created_at?: string;
  createdAt?: string;
  posts?: {
    id?: string;
    title?: string | null;
  } | null;
};

export type MyPageReview = {
  id: string;
  content: string;
  created_at?: string;
  createdAt?: string;
  posts?: {
    title?: string | null;
    id?: string | null;
  } | null;
};

export type MyPointTransaction = {
  id: string;
  points: number;
  transaction_type: string;
  description: string;
  created_at: string;
  post_id?: string | null;
  posts?: {
    id?: string | null;
    title?: string | null;
  } | null;
};

export type MyPageOverviewData = {
  profile: MyPageProfile;
  counts: {
    pendingIncomingRequests: number;
    pendingApplications: number;
    attendanceActions: number;
    completedActivities: number;
    hostedPosts: number;
    scraps: number;
    reviews: number;
  };
  previews: {
    incomingRequests: MyPageIncomingRequest[];
    applications: MyPageApplication[];
    attendancePosts: MyPageHostingPost[];
    completedActivities: MyPageApplication[];
  };
};

export type MyPageApplicationsData = {
  profile: MyPageProfile;
  activeApplications: MyPageApplication[];
  completedActivities: MyPageApplication[];
};

export type MyPageHostingData = {
  profile: MyPageProfile;
  incomingRequests: MyPageIncomingRequest[];
  attendancePosts: MyPageHostingPost[];
  hostedPosts: MyPageHostingPost[];
};

export type MyPageHistoryData = {
  profile: MyPageProfile;
  completedActivities: MyPageApplication[];
  scraps: MyPageScrap[];
  reviews: MyPageReview[];
  pointTransactions: MyPointTransaction[];
};

function normalizeDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

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

function deriveCompletedActivities(applications: MyPageApplication[]) {
  const today = getToday();

  return applications.filter((application) => {
    if (!application.attended_at) return false;
    const dueDate = normalizeDate(application.posts?.due_date);
    return Boolean(dueDate && dueDate <= today);
  });
}

function deriveActiveApplications(applications: MyPageApplication[]) {
  const completedIds = new Set(deriveCompletedActivities(applications).map((application) => application.id));
  return applications.filter((application) => !completedIds.has(application.id));
}

function normalizeHostingPosts(rows: Array<Record<string, unknown>>): MyPageHostingPost[] {
  return rows.map((row) => ({
    id: String(row.id ?? ''),
    title: String(row.title ?? ''),
    due_date: (row.due_date as string | null | undefined) ?? null,
    volunteer_hours: (row.volunteer_hours as number | null | undefined) ?? null,
    current_participants: Number(row.current_participants ?? 0),
    max_participants: Number(row.max_participants ?? 0),
    is_recruiting: Boolean(row.is_recruiting),
    applications: Array.isArray(row.applications)
      ? row.applications.map((application) => {
          const applicationRow = application as Record<string, unknown>;
          const userRow = Array.isArray(applicationRow.users)
            ? (applicationRow.users[0] as Record<string, unknown> | undefined)
            : (applicationRow.users as Record<string, unknown> | undefined);

          return {
            id: String(applicationRow.id ?? ''),
            status: String(applicationRow.status ?? ''),
            created_at: (applicationRow.created_at as string | undefined) ?? undefined,
            attended_at: (applicationRow.attended_at as string | null | undefined) ?? null,
            points_awarded_at: (applicationRow.points_awarded_at as string | null | undefined) ?? null,
            users: userRow
              ? {
                  username: (userRow.username as string | null | undefined) ?? null,
                  contact: (userRow.contact as string | null | undefined) ?? null,
                  email: (userRow.email as string | null | undefined) ?? null,
                  job: (userRow.job as string | null | undefined) ?? null,
                  address: (userRow.address as string | null | undefined) ?? null,
                }
              : null,
          };
        })
      : [],
  }));
}

function deriveIncomingRequests(posts: MyPageHostingPost[]): MyPageIncomingRequest[] {
  return posts.flatMap((post) =>
    post.applications
      .filter((application) => application.status === 'pending')
      .map((application) => ({
        id: application.id,
        status: application.status,
        created_at: application.created_at ?? new Date().toISOString(),
        users: application.users,
        post: {
          id: post.id,
          title: post.title,
          current_participants: post.current_participants,
          max_participants: post.max_participants,
        },
      }))
  );
}

function deriveAttendancePosts(posts: MyPageHostingPost[]) {
  const today = getToday();

  return posts.filter((post) => {
    const dueDate = normalizeDate(post.due_date);
    if (!dueDate || dueDate > today) return false;
    return post.applications.some((application) => application.status === 'approved');
  });
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

export async function getMyHistoryPageData(limit = 12): Promise<MyPageHistoryData> {
  const { supabase, authUser, profile } = await getMyPageProfile();

  const [applicationsRes, scrapsRes, reviewsRes, pointTransactionsRes] = await Promise.all([
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
      .range(0, limit - 1),
    supabase
      .from('reviews')
      .select('id, content, created_at, posts(title, id)')
      .eq('author_id', authUser.id)
      .order('created_at', { ascending: false })
      .range(0, limit - 1),
    supabase
      .from('point_transactions')
      .select('id, points, transaction_type, description, created_at, post_id, posts(id, title)')
      .eq('user_id', authUser.id)
      .order('created_at', { ascending: false })
      .range(0, limit - 1),
  ]);

  return {
    profile,
    completedActivities: deriveCompletedActivities((applicationsRes.data ?? []) as MyPageApplication[]),
    scraps: (scrapsRes.data ?? []) as MyPageScrap[],
    reviews: (reviewsRes.data ?? []) as MyPageReview[],
    pointTransactions: (pointTransactionsRes.data ?? []) as MyPointTransaction[],
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
