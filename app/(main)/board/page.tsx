import { getPosts } from '@/actions/posts';
import UrgentSection from '@/components/UrgentSection';
import InfiniteScrollBoard from '@/components/InfiniteScrollBoard';
import StatusFilter from '@/components/StatusFilter';
import SearchInput from '@/components/SearchInput';
import Link from 'next/link';
import CategoryFilter from '@/components/CategoryFilter';
import SortFilter from '@/components/SortFilter';

export const dynamic = 'force-dynamic';

export default async function BoardPage(props: { searchParams: Promise<{ sort?: 'latest' | 'deadline'; category?: string; status?: 'recruiting' | 'closed' | 'all'; q?: string }> }) {
  const searchParams = await props.searchParams;
  const sort = searchParams.sort || 'latest';
  const category = searchParams.category === 'all' ? undefined : searchParams.category;
  const status = searchParams.status || 'recruiting';
  const q = searchParams.q;

  const initialData = await getPosts({ page: 1, limit: 10, sort, category, status, q });

  return (
    <div className="pb-20 relative min-h-screen">
      {/* Header with Search/Filter Title */}
      <div className="bg-white sticky top-0 z-30 px-4 py-3 border-b border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">봉사활동 찾기</h1>
          </div>
          <div className="flex space-x-3 items-center">
            <SearchInput />
          </div>
        </div>

        {/* Sort & Status Filters Row */}
        <div className="flex items-center justify-between mb-3 mt-1">
          <StatusFilter />
          <SortFilter />
        </div>

        {/* Category Filter */}
        <CategoryFilter />
      </div>

      <div className="p-4 space-y-6">
        {/* Urgent Section Always Visible */}
        <UrgentSection />

        <InfiniteScrollBoard
          initialPosts={initialData.posts}
          initialNextId={initialData.nextId}
          sort={sort}
          category={category}
          status={status}
          q={q}
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
