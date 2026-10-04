import { getPosts } from '@/actions/posts';
import UrgentSection from '@/components/UrgentSection';
import InfiniteScrollBoard from '@/components/InfiniteScrollBoard';
import StatusFilter from '@/components/StatusFilter';
import SearchInput from '@/components/SearchInput';
import CategoryFilter from '@/components/CategoryFilter';
import SortFilter from '@/components/SortFilter';
import { Plus } from 'lucide-react';
import { getOptionalApprovedUser } from '@/lib/server-auth';
import LoginGateLink from '@/components/LoginGateLink';

export const dynamic = 'force-dynamic';

export default async function BoardPage(props: { searchParams: Promise<{ sort?: 'latest' | 'deadline'; category?: string; status?: 'recruiting' | 'closed' | 'all'; q?: string }> }) {
  const searchParams = await props.searchParams;
  const sort = searchParams.sort || 'latest';
  const category = searchParams.category === 'all' ? undefined : searchParams.category;
  const status = searchParams.status || 'recruiting';
  const q = searchParams.q;

  const [initialData, viewer] = await Promise.all([
    getPosts({ page: 1, limit: 10, sort, category, status, q }),
    getOptionalApprovedUser(),
  ]);

  return (
    <div className="relative min-h-screen bg-slate-50/70 pb-28">
      {/* Header with Search/Filter Title */}
      <div className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Volunteer board</p>
              <h1 className="text-xl font-semibold tracking-[-0.02em] text-slate-900">봉사활동 찾기</h1>
            </div>
          </div>
          <div className="flex items-center">
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

      <div className="space-y-6 p-4">
        {/* Urgent Section Always Visible */}
        <UrgentSection status={status} />

        <InfiniteScrollBoard
          key={`${sort}-${category ?? 'all'}-${status}-${q ?? ''}`}
          initialPosts={initialData.posts}
          initialNextId={initialData.nextId}
          sort={sort}
          category={category}
          status={status}
          q={q}
        />
      </div>

      {/* Floating Action Button for Writing */}
      <LoginGateLink
        href="/board/write"
        isAuthenticated={Boolean(viewer)}
        className="fixed bottom-[108px] right-6 z-40 flex transform items-center justify-center rounded-full bg-amber-600 p-4 text-white shadow-[0_14px_30px_rgba(217,119,6,0.28)] transition-transform hover:-translate-y-1 hover:bg-amber-700 active:scale-95"
        ariaLabel={viewer ? '글쓰기' : '로그인 후 봉사활동 등록하기'}
        message="봉사활동을 등록하려면 로그인이 필요해요. 로그인 페이지로 이동할까요?"
      >
        <Plus className="w-6 h-6" strokeWidth={3} />
      </LoginGateLink>
    </div>
  );
}
