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
};

export type MyPagePointsData = {
  profile: MyPageProfile;
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

export function deriveCompletedActivities(applications: MyPageApplication[]) {
  const today = getToday();

  return applications.filter((application) => {
    if (!application.attended_at) return false;
    const dueDate = normalizeDate(application.posts?.due_date);
    return Boolean(dueDate && dueDate <= today);
  });
}

export function deriveActiveApplications(applications: MyPageApplication[]) {
  const completedIds = new Set(deriveCompletedActivities(applications).map((application) => application.id));
  return applications.filter((application) => !completedIds.has(application.id));
}

export function normalizeHostingPosts(rows: Array<Record<string, unknown>>): MyPageHostingPost[] {
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

export function deriveIncomingRequests(posts: MyPageHostingPost[]): MyPageIncomingRequest[] {
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

export function deriveAttendancePosts(posts: MyPageHostingPost[]) {
  const today = getToday();

  return posts.filter((post) => {
    const dueDate = normalizeDate(post.due_date);
    if (!dueDate || dueDate > today) return false;
    return post.applications.some(
      (application) =>
        application.status === 'approved' && !application.attended_at && !application.points_awarded_at
    );
  });
}
