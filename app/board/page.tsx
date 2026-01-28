import { getPosts } from '@/actions/posts';
import UrgentSection from '@/components/UrgentSection';
import InfiniteScrollBoard from '@/components/InfiniteScrollBoard';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const CATEGORIES = [
  { id: 'all', name: '전체' },
  { id: '교육', name: '교육' },
  { id: '환경', name: '환경' },
  { id: '의료', name: '의료' },
  { id: '동물', name: '동물' },
  { id: '문화', name: '문화' },
  { id: '기타', name: '기타' },
];

export default async function BoardPage(props: { searchParams: Promise<{ sort?: 'latest' | 'popular'; category?: string }> }) {
  const searchParams = await props.searchParams;
  const sort = searchParams.sort || 'latest';
  const category = searchParams.category === 'all' ? undefined : searchParams.category;
  
  const initialData = await getPosts({ page: 1, limit: 10, sort, category });

  return (
    <div className="pb-20 relative min-h-screen">
      {/* Header with Search/Filter Title */}
      <div className="bg-white sticky top-0 z-30 px-4 py-3 border-b border-gray-100 shadow-sm">
         <div className="flex items-center justify-between mb-3">
             <h1 className="text-xl font-bold text-gray-900 tracking-tight">봉사활동 찾기</h1>
             <div className="flex space-x-3">
                <Link 
                  href={`/board?sort=latest${category ? `&category=${category}` : ''}`} 
                  className={`text-sm font-medium transition-colors ${sort === 'latest' ? 'text-gray-900' : 'text-gray-400 hover:text-indigo-600'}`}
                >
                  최신순
                </Link>
                <span className="text-gray-200">|</span>
                <Link 
                  href={`/board?sort=popular${category ? `&category=${category}` : ''}`} 
                  className={`text-sm font-medium transition-colors ${sort === 'popular' ? 'text-gray-900' : 'text-gray-400 hover:text-indigo-600'}`}
                >
                  인기순
                </Link>
             </div>
         </div>
         
         {/* Category Filter */}
         <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map((cat) => (
                <Link
                    key={cat.id}
                    href={`/board?category=${cat.id}&sort=${sort}`}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        (searchParams.category === cat.id || (!searchParams.category && cat.id === 'all'))
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    {cat.name}
                </Link>
            ))}
         </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Only show Urgent Section if no category filter or 'all' (optional, but usually urgent is global) */}
        {!category && <UrgentSection />}
        
        <InfiniteScrollBoard 
          initialPosts={initialData.posts} 
          initialNextId={initialData.nextId} 
          sort={sort}
          category={category}
        />
      </div>

      {/* Floating Action Button for Writing */}
      <Link 
        href="/board/write"
        className="fixed bottom-20 right-6 p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-transform active:scale-95 z-40 flex items-center justify-center transform hover:-translate-y-1"
        aria-label="글쓰기"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </Link>
    </div>
  );
}
