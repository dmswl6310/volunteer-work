import { getPost } from '@/actions/get-post';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import FallbackImage from '@/components/FallbackImage';
import ApplyButton from './ApplyButton';
import ReviewList from '@/components/ReviewList';
import ScrapButton from '@/components/ScrapButton';
import { createServerSupabaseClient } from '@/lib/supabase';
import { ChevronLeft, Clock3, Phone } from 'lucide-react';

export default async function PostDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const post = await getPost(params.id);

  if (!post) {
    notFound();
  }

  const supabase = await createServerSupabaseClient();

  // 승인된 참여자 목록 조회
  const { data: approvedApps } = await supabase
    .from('applications')
    .select('id')
    .eq('post_id', post.id)
    .eq('status', 'approved');
  const approvedCount = approvedApps?.length ?? 0;

  // 현재 유저의 스크랩 여부 확인
  const { data: { user } } = await supabase.auth.getUser();
  let isScraped = false;
  let userApplicationStatus: string | null = null;
  const isAuthor = !!user && user.id === post.author_id;

  if (user) {
    const [scrapRes, applyRes] = await Promise.all([
      supabase.from('post_scraps').select('id').eq('post_id', post.id).eq('user_id', user.id).maybeSingle(),
      supabase.from('applications').select('id, status').eq('post_id', post.id).eq('user_id', user.id).maybeSingle(),
    ]);
    isScraped = !!scrapRes.data;
    userApplicationStatus = applyRes.data?.status || null;
  }

  // 마감일 확인
  let isExpired = false;
  let diffDays = 0;
  if (post.due_date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(post.due_date);
    dueDate.setHours(0, 0, 0, 0);
    isExpired = dueDate < today;
    diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  const isFull = post.current_participants >= post.max_participants;

  return (
    <div className="pb-24 bg-white min-h-screen">
      {/* 상단 네비게이션 (뒤로가기 버튼) */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <Link href="/board" className="p-2 -ml-2 rounded-full hover:bg-gray-100">
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </Link>
        <h2 className="text-sm font-bold text-gray-900 truncate max-w-[200px]">{post.title}</h2>
        <div className="w-8"></div> {/* 레이아웃 여백 */}
      </div>

      {/* 이미지 헤더 */}
      <div className="relative w-full aspect-video bg-gray-200">
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
          <div className="flex items-center space-x-2 mb-2">
              <span className="inline-block rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-600">
                {post.category}
              </span>
            {post.due_date && post.is_recruiting && !isExpired && !isFull && (
              <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full bg-red-50 text-red-500`}>
                {diffDays === 0 ? 'D-Day' : `D-${diffDays}`}
              </span>
            )}
            {(!post.is_recruiting || isExpired || isFull) && (
              <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${isFull && !isExpired && post.is_recruiting ? 'bg-orange-50 text-orange-500' : 'bg-gray-100 text-gray-500'}`}>
                {isExpired || !post.is_recruiting ? '마감됨' : '모집 완료'}
              </span>
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-2">
            {post.title}
          </h1>
          <div className="flex items-center text-sm text-gray-500 space-x-3">
            <span>{new Date(post.created_at).toLocaleDateString()}</span>
            <span>·</span>
            <span>조회 {post.views}</span>
          </div>
        </div>

        {/* 주최자 프로필 */}
        <div className="mb-8 flex items-center rounded-2xl bg-gray-50 p-4">
          <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-lg font-bold text-teal-600">
            {post.author.username?.[0] || 'A'}
          </div>
          <div>
            <p className="font-bold text-gray-900">
              {post.author.username || '익명'}
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-700">
              <Phone className="h-4 w-4 text-teal-500" />
              <span>{post.author.contact || '연락처 미등록'}</span>
            </div>
          </div>
        </div>

        {/* 본문 */}
        <div className="prose prose-indigo max-w-none mb-10 text-gray-800 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </div>

        {/* 정보 그리드 */}
        <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-3">
          <div className="bg-gray-50 p-4 rounded-xl text-center">
            <p className="text-xs text-gray-500 mb-1">참여 인원</p>
            <p className="text-lg font-bold text-teal-600">
              {post.current_participants} / {post.max_participants}명
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl text-center">
            <p className="text-xs text-gray-500 mb-1">봉사 시간</p>
            <p className="inline-flex items-center gap-1 text-lg font-bold text-teal-600">
              <Clock3 className="h-4 w-4" />
              <span>{post.volunteer_hours ?? 1}시간</span>
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl text-center">
            <p className="text-xs text-gray-500 mb-1">마감 기한</p>
            <p className="text-sm font-bold text-gray-900">
              {post.due_date ? new Date(post.due_date).toLocaleDateString() : '상시 모집'}
            </p>
          </div>
        </div>

        {/* 참여 확정 명단 */}
        <div className="mb-10">
          <h3 className="font-bold text-gray-900 mb-3">참여 확정 현황</h3>
          {approvedCount === 0 ? (
            <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-500 text-center">
              아직 승인된 참여자가 없습니다.
            </div>
          ) : (
            <div className="p-4 bg-green-50 rounded-xl text-center">
              <p className="text-sm text-green-700">현재 승인된 참여자</p>
              <p className="mt-1 text-2xl font-bold text-green-600">{approvedCount}명</p>
            </div>
          )}
        </div>

        {/* 후기 섹션 */}
        <div className="mb-8">
          <ReviewList postId={post.id} userId={user?.id} />
        </div>
      </div>

      {/* 하단 고정 액션 바 */}
      <div className="fixed bottom-[64px] left-0 right-0 p-4 bg-white border-t border-gray-100 flex items-center justify-between safe-area-bottom max-w-md mx-auto z-40 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex items-center space-x-4">
          <ScrapButton
            postId={post.id}
            initialIsScraped={isScraped}
            initialScrapCount={post.scraps}
          />
        </div>
        <div className="flex-1 ml-4">
          <ApplyButton
            postId={post.id}
            isRecruiting={post.is_recruiting && !isExpired && !isFull}
            isAuthor={isAuthor}
            userApplicationStatus={userApplicationStatus}
            isFull={isFull}
          />
        </div>
      </div>
    </div>
  );
}
