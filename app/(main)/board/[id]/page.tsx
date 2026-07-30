import { getOrganizerContactForViewer, getPost } from '@/actions/get-post';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import FallbackImage from '@/components/FallbackImage';
import ApplyButton from './ApplyButton';
import ReviewList from '@/components/ReviewList';
import ScrapButton from '@/components/ScrapButton';
import { ChevronLeft, Clock3, LockKeyhole, Phone } from 'lucide-react';
import { getPostStatus } from '@/lib/post-status';
import { getOptionalApprovedUser } from '@/lib/server-auth';

export default async function PostDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id: postId } = await props.params;
  const post = await getPost(postId);

  if (!post) {
    notFound();
  }

  const viewer = await getOptionalApprovedUser();
  let isScraped = false;
  let userApplicationStatus: string | null = null;
  let organizerContactAccess = { canView: false, contact: null as string | null };
  const isAuthor = Boolean(viewer && viewer.user.id === post.author_id);

  if (viewer) {
    const [scrapRes, applyRes, contactAccess] = await Promise.all([
      viewer.supabase.from('post_scraps').select('id').eq('post_id', post.id).eq('user_id', viewer.user.id).maybeSingle(),
      viewer.supabase.from('applications').select('id, status').eq('post_id', post.id).eq('user_id', viewer.user.id).maybeSingle(),
      getOrganizerContactForViewer(post.id),
    ]);
    isScraped = !!scrapRes.data;
    userApplicationStatus = applyRes.data?.status || null;
    organizerContactAccess = contactAccess;
  }

  const { isExpired, diffDays, isFull, isOpenRecruiting } = getPostStatus({
    dueDate: post.due_date,
    isRecruiting: post.is_recruiting,
    currentParticipants: post.current_participants,
    maxParticipants: post.max_participants,
  });

  return (
    <div className="min-h-screen bg-slate-50/70 pb-52">
      {/* 상단 네비게이션 (뒤로가기 버튼) */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-md">
        <Link href="/board" className="-ml-2 rounded-full p-2 transition-colors hover:bg-slate-100">
          <ChevronLeft className="h-6 w-6 text-slate-700" />
        </Link>
        <h2 className="flex-1 whitespace-normal break-words px-2 text-center text-sm font-semibold leading-snug text-slate-900 [word-break:keep-all]">{post.title}</h2>
        <div className="w-8"></div> {/* 레이아웃 여백 */}
      </div>

      {/* 이미지 헤더 */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-200">
        {post.image_url ? (
          <Image 
            src={post.image_url} 
            alt={post.title} 
            fill 
            className="object-cover" 
            sizes="(max-width: 448px) 100vw, 448px"
            priority
          />
        ) : (
          <FallbackImage category={post.category ?? undefined} iconSize={48} />
        )}
      </div>

      <div className="px-5 py-6">
        {/* 제목 및 카테고리 */}
        <div className="mb-6">
          <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-block rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                 {post.category}
               </span>
            {post.due_date && isOpenRecruiting && diffDays !== null && (
              <span className="inline-block rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">
                {diffDays === 0 ? 'D-Day' : `D-${diffDays}`}
              </span>
            )}
            {(!post.is_recruiting || isExpired || isFull) && (
              <span className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold ${isFull && !isExpired && post.is_recruiting ? 'border-slate-200 bg-slate-100 text-slate-600' : 'border-slate-200 bg-slate-100 text-slate-500'}`}>
                {isExpired || !post.is_recruiting ? '마감됨' : '모집 완료'}
              </span>
            )}
          </div>

          <h1 className="mb-2 text-[28px] font-semibold leading-tight tracking-[-0.03em] text-slate-900">
            {post.title}
          </h1>
          <div className="flex items-center space-x-3 text-sm text-slate-500">
            <span>{new Date(post.created_at).toLocaleDateString()}</span>
            <span>·</span>
            <span>조회 {post.views}</span>
          </div>
        </div>

        {/* 주최자 프로필 */}
        <div className="mb-8 flex items-center rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
          <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-lg font-semibold text-amber-600">
            {post.author?.username?.[0] || 'A'}
          </div>
          <div>
            <p className="font-semibold text-slate-900">
              {post.author?.username || '익명'}
            </p>
            <div className={`mt-2 flex items-center gap-1.5 text-sm ${organizerContactAccess.canView ? 'text-slate-700' : 'text-slate-500'}`}>
              {organizerContactAccess.canView ? (
                <Phone className="h-4 w-4 text-amber-500" />
              ) : (
                <LockKeyhole className="h-4 w-4 text-slate-400" />
              )}
              <span>
                {organizerContactAccess.canView
                  ? organizerContactAccess.contact || '연락처 미등록'
                  : '참여 승인 후 연락처를 확인할 수 있어요'}
              </span>
            </div>
          </div>
        </div>

        {/* 본문 */}
        <div className="mb-10 rounded-3xl border border-slate-200 bg-white px-5 py-6 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
          <div className="prose prose-amber max-w-none whitespace-pre-wrap leading-relaxed text-slate-800">
            {post.content}
          </div>
        </div>

        {/* 정보 그리드 */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 text-center shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
            <p className="mb-1 text-xs text-slate-500">참여 인원</p>
            <p className="text-lg font-semibold text-amber-600">
              {post.current_participants} / {post.max_participants}명
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-4 text-center shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
            <p className="mb-1 text-xs text-slate-500">봉사 시간</p>
            <p className="inline-flex items-center gap-1 text-lg font-semibold text-amber-600">
              <Clock3 className="h-4 w-4" />
              <span>{post.volunteer_hours ?? 1}시간</span>
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-4 text-center shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
            <p className="mb-1 text-xs text-slate-500">모집 마감 기한</p>
            <p className="text-sm font-semibold text-slate-900">
              {post.due_date ? new Date(post.due_date).toLocaleDateString() : '상시 모집'}
            </p>
          </div>
        </div>

        {/* 참여 확정 명단 */}
        <div className="mb-10">
          <h3 className="mb-3 text-lg font-semibold text-slate-900">참여 확정 현황</h3>
          {post.current_participants === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-5 text-center text-sm text-slate-500">
              아직 승인된 참여자가 없습니다.
            </div>
          ) : (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-5 text-center">
              <p className="text-sm text-emerald-700">현재 승인된 참여자</p>
              <p className="mt-1 text-2xl font-semibold text-emerald-600">{post.current_participants}명</p>
            </div>
          )}
        </div>

        {/* 후기 섹션 */}
        <div className="mb-8">
          <ReviewList postId={post.id} userId={viewer?.user.id} canInteract={Boolean(viewer)} />
        </div>
      </div>

      {/* 하단 고정 액션 바 */}
      <div className="fixed bottom-[calc(104px+env(safe-area-inset-bottom))] left-0 right-0 z-40 mx-auto flex max-w-md items-center justify-between border-t border-slate-200 bg-white/95 p-4 shadow-[0_-8px_20px_rgba(15,23,42,0.06)] backdrop-blur">
        <div className="flex items-center space-x-4">
          <ScrapButton
            postId={post.id}
            initialIsScraped={isScraped}
            initialScrapCount={post.scraps}
            canInteract={Boolean(viewer)}
          />
        </div>
        <div className="flex-1 ml-4">
            <ApplyButton
             postId={post.id}
             isRecruiting={isOpenRecruiting}
             isAuthor={isAuthor}
             userApplicationStatus={userApplicationStatus}
             isFull={isFull}
             isAuthenticated={Boolean(viewer)}
          />
        </div>
      </div>
    </div>
  );
}
