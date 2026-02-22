import { getPost } from '@/actions/get-post';
import { notFound } from 'next/navigation';
import ApplyButton from './ApplyButton';
import ReviewList from '@/components/ReviewList';
import ScrapButton from '@/components/ScrapButton';
import { createServerSupabaseClient } from '@/lib/supabase';
import Link from 'next/link';

export default async function PostDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const post = await getPost(params.id);

  if (!post) {
    notFound();
  }

  const supabase = await createServerSupabaseClient();

  // Fetch Approved Participants
  const { data: approvedApps } = await supabase
    .from('applications')
    .select('*, users(id, name, username)')
    .eq('post_id', post.id)
    .eq('status', 'approved');

  // Check if current user has scrapped this post
  const { data: { user } } = await supabase.auth.getUser();
  let isScraped = false;
  let hasApplied = false;
  const isAuthor = !!user && user.id === (post as any).author_id;

  if (user) {
    const [scrapRes, applyRes] = await Promise.all([
      supabase.from('post_scraps').select('id').eq('post_id', post.id).eq('user_id', user.id).maybeSingle(),
      supabase.from('applications').select('id').eq('post_id', post.id).eq('user_id', user.id).maybeSingle(),
    ]);
    isScraped = !!scrapRes.data;
    hasApplied = !!applyRes.data;
  }

  // Check Due Date
  const isExpired = post.due_date ? new Date(post.due_date) < new Date() : false;

  return (
    <div className="pb-24 bg-white min-h-screen">
      {/* Top Nav (Optional, since we have BottomNav, but detail usually has Back button) */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <Link href="/board" className="p-2 -ml-2 rounded-full hover:bg-gray-100">
          <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h2 className="text-sm font-bold text-gray-900 truncate max-w-[200px]">{post.title}</h2>
        <div className="w-8"></div> {/* Spacer */}
      </div>

      {/* Image Header */}
      <div className="relative w-full aspect-video bg-gray-200">
        {post.image_url ? (
          <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
      </div>

      <div className="px-5 py-6">
        {/* Title & Category */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full">
              {post.category}
            </span>
            {post.due_date && (
              <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${isExpired ? 'bg-gray-100 text-gray-500' : 'bg-red-50 text-red-500'}`}>
                {isExpired ? '마감됨' : `D-${Math.ceil((new Date(post.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}`}
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

        {/* Organizer Profile */}
        <div className="flex items-center p-4 bg-gray-50 rounded-xl mb-8">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-lg mr-4">
            {post.author.name?.[0] || 'A'}
          </div>
          <div>
            <p className="font-bold text-gray-900">
              {post.author.name && post.author.name !== 'User' ? post.author.name : post.author.username}
            </p>
            <p className="text-xs text-gray-500">@{post.author.username}</p>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-indigo max-w-none mb-10 text-gray-800 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-50 p-4 rounded-xl text-center">
            <p className="text-xs text-gray-500 mb-1">참여 인원</p>
            <p className="text-lg font-bold text-indigo-600">
              {post.current_participants} / {post.max_participants}명
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl text-center">
            <p className="text-xs text-gray-500 mb-1">마감 기한</p>
            <p className="text-sm font-bold text-gray-900">
              {post.due_date ? new Date(post.due_date).toLocaleDateString() : '상시 모집'}
            </p>
          </div>
        </div>

        {/* Approved Participants List */}
        <div className="mb-10">
          <h3 className="font-bold text-gray-900 mb-3">참여 확정 명단 ({approvedApps?.length ?? 0}명)</h3>
          {!approvedApps || approvedApps.length === 0 ? (
            <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-500 text-center">
              아직 승인된 참여자가 없습니다.
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {approvedApps.map((app: any) => (
                <div key={app.id} className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-xs mb-1">
                    {app.users?.name?.[0] || 'U'}
                  </div>
                  <span className="text-xs text-gray-700 truncate w-full text-center">
                    {app.users?.name && app.users.name !== 'User' ? app.users.name : app.users?.username}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div className="mb-8">
          <ReviewList postId={post.id} />
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
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
            isRecruiting={post.is_recruiting && !isExpired}
            isAuthor={isAuthor}
            hasApplied={hasApplied}
          />
        </div>
      </div>
    </div>
  );
}
