import { getPosts } from '@/actions/posts';
import PostCard from '@/components/PostCard';
import UrgentSection from '@/components/UrgentSection';
import InfiniteScrollBoard from '@/components/InfiniteScrollBoard';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function BoardPage(props: { searchParams: Promise<{ sort?: 'latest' | 'popular' }> }) {
  const searchParams = await props.searchParams;
  const sort = searchParams.sort || 'latest';
  const initialData = await getPosts({ page: 1, limit: 10, sort });

  return (
    <div className="pb-20 relative min-h-screen">
      <div className="bg-white sticky top-14 z-30 px-4 py-3 border-b border-gray-100 flex items-center justify-between shadow-sm">
         <h1 className="text-xl font-bold text-gray-900 tracking-tight">봉사활동 찾기</h1>
         <div className="flex space-x-3">
            <Link 
              href="/board?sort=latest" 
              className={`text-sm font-medium transition-colors ${sort === 'latest' ? 'text-gray-900' : 'text-gray-400 hover:text-indigo-600'}`}
            >
              최신순
            </Link>
            <span className="text-gray-200">|</span>
            <Link 
              href="/board?sort=popular" 
              className={`text-sm font-medium transition-colors ${sort === 'popular' ? 'text-gray-900' : 'text-gray-400 hover:text-indigo-600'}`}
            >
              인기순
            </Link>
         </div>
      </div>

      <div className="p-4">
        <UrgentSection />
        
        <InfiniteScrollBoard 
          initialPosts={initialData.posts} 
          initialNextId={initialData.nextId} 
          sort={sort}
        />
      </div>

      {/* Floating Action Button for Writing */}
      <Link 
        href="/board/write"
        className="fixed bottom-6 right-6 p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-transform active:scale-95 z-50 flex items-center justify-center"
        aria-label="글쓰기"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </Link>
    </div>
  );
}
