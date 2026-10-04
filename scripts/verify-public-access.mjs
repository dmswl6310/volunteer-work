const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function main() {
if (!supabaseUrl || !anonKey || !serviceRoleKey) {
  throw new Error(
    'NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY가 필요합니다.'
  );
}

function authHeaders(key, extra = {}) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    Prefer: 'count=exact',
    ...extra,
  };
}

async function request(key, path, init = {}) {
  const response = await fetch(`${supabaseUrl}${path}`, {
    ...init,
    headers: authHeaders(key, init.headers),
  });
  const rawBody = await response.text();
  let body = null;

  try {
    body = rawBody ? JSON.parse(rawBody) : null;
  } catch {
    body = rawBody;
  }

  return {
    status: response.status,
    contentRange: response.headers.get('content-range'),
    body,
  };
}

function totalFromContentRange(contentRange) {
  if (!contentRange) return null;
  const total = Number(contentRange.split('/')[1]);
  return Number.isFinite(total) ? total : null;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function tableProbe(key, table, columns) {
  return request(key, `/rest/v1/${table}?select=${encodeURIComponent(columns)}&limit=1`);
}

const [servicePosts, anonPosts, serviceReviews, anonReviews, anonUsers] = await Promise.all([
  tableProbe(serviceRoleKey, 'posts', 'id,author_id'),
  tableProbe(anonKey, 'posts', 'id,author_id'),
  tableProbe(serviceRoleKey, 'reviews', 'id'),
  tableProbe(anonKey, 'reviews', 'id'),
  tableProbe(anonKey, 'users', 'id'),
]);

const servicePostTotal = totalFromContentRange(servicePosts.contentRange);
const anonPostTotal = totalFromContentRange(anonPosts.contentRange);
const serviceReviewTotal = totalFromContentRange(serviceReviews.contentRange);
const anonReviewTotal = totalFromContentRange(anonReviews.contentRange);

assert(servicePosts.status < 300, 'service_role 게시글 조회에 실패했습니다.');
assert(anonPosts.status < 300, '비회원 게시글 조회가 허용되지 않았습니다.');
assert(
  anonPostTotal === servicePostTotal,
  `비회원 게시글 수가 전체 게시글 수와 다릅니다. (${anonPostTotal}/${servicePostTotal})`
);

assert(serviceReviews.status < 300, 'service_role 후기 조회에 실패했습니다.');
assert(anonReviews.status < 300, '비회원 후기 조회가 허용되지 않았습니다.');
assert(
  anonReviewTotal === serviceReviewTotal,
  `비회원 후기 수가 전체 후기 수와 다릅니다. (${anonReviewTotal}/${serviceReviewTotal})`
);

const anonUserRows = Array.isArray(anonUsers.body) ? anonUsers.body.length : 0;
assert(
  anonUsers.status === 401 || anonUsers.status === 403 || anonUserRows === 0,
  '비회원이 users 원본 행을 조회할 수 있습니다.'
);

const firstPost = Array.isArray(servicePosts.body) ? servicePosts.body[0] : null;
if (firstPost?.author_id) {
  const publicProfile = await request(anonKey, '/rest/v1/rpc/get_public_profiles', {
    method: 'POST',
    body: JSON.stringify({ profile_ids: [firstPost.author_id] }),
  });

  assert(publicProfile.status < 300, '공개 닉네임 RPC 호출에 실패했습니다.');
  assert(
    Array.isArray(publicProfile.body) &&
      publicProfile.body.length === 1 &&
      Object.keys(publicProfile.body[0]).every((key) => key === 'id' || key === 'username'),
    '공개 닉네임 RPC가 예상하지 않은 데이터를 반환했습니다.'
  );
}

const firstReview = Array.isArray(serviceReviews.body) ? serviceReviews.body[0] : null;
if (firstReview?.id) {
  const publicLikeCount = await request(anonKey, '/rest/v1/rpc/get_public_review_like_counts', {
    method: 'POST',
    body: JSON.stringify({ review_ids: [firstReview.id] }),
  });

  assert(publicLikeCount.status < 300, '공개 후기 좋아요 합계 RPC 호출에 실패했습니다.');
  assert(Array.isArray(publicLikeCount.body), '공개 후기 좋아요 합계 형식이 올바르지 않습니다.');
}

const anonymousContact = await request(anonKey, '/rest/v1/rpc/get_organizer_contact', {
  method: 'POST',
  body: JSON.stringify({ target_post_id: firstPost?.id ?? '__verification__' }),
});

const anonymousApproval = await request(anonKey, '/rest/v1/rpc/approve_user', {
  method: 'POST',
  body: JSON.stringify({ target_user_id: '__verification__' }),
});

assert(
  anonymousContact.status === 401 ||
    anonymousContact.status === 403 ||
    (Array.isArray(anonymousContact.body) && anonymousContact.body.length === 0),
  '비회원이 주최자 연락처 RPC를 사용할 수 있습니다.'
);

assert(
  anonymousApproval.status === 401 ||
    anonymousApproval.status === 403 ||
    anonymousApproval.status === 404,
  '비회원이 사용자 승인 RPC를 호출할 수 있습니다.'
);

console.log(
  JSON.stringify(
    {
      publicPosts: anonPostTotal,
      publicReviews: anonReviewTotal,
      directAnonymousUsers: 'blocked',
      publicProfileRpc: firstPost ? 'ok' : 'skipped-no-post',
      publicReviewLikeCountRpc: firstReview ? 'ok' : 'skipped-no-review',
      anonymousOrganizerContact: 'blocked',
      anonymousUserApproval: 'blocked',
    },
    null,
    2
  )
);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`공개 접근 검증 실패: ${message}`);
  process.exitCode = 1;
});
