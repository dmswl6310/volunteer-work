import Link from 'next/link';
import { getMyPointsPageData } from '@/actions/user';

function parseLimit(limit?: string) {
  const parsed = Number(limit);
  if (!Number.isFinite(parsed) || parsed <= 0) return 20;
  return Math.min(parsed, 100);
}

function formatDate(dateValue?: string | null) {
  return dateValue ? new Date(dateValue).toLocaleDateString() : '-';
}

export default async function MyPointsPage({ searchParams }: { searchParams?: Promise<{ limit?: string }> }) {
  const params = await searchParams;
  const limit = parseLimit(params?.limit);
  const { profile, pointTransactions } = await getMyPointsPageData(limit);

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Points</p>
            <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-slate-900">포인트 내역</h2>
          </div>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-bold text-indigo-700">
            {profile.points.toLocaleString()} P
          </span>
        </div>
        <p className="text-sm text-slate-500">적립된 포인트를 통장처럼 순서대로 확인할 수 있어요.</p>
      </section>

      <section>
        {pointTransactions.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center text-sm text-gray-400 shadow-sm">포인트 적립 내역이 없습니다.</div>
        ) : (
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm divide-y divide-gray-100">
            {pointTransactions.map((transaction) => (
              <div key={transaction.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-gray-900">{transaction.description}</p>
                    <p className="mt-1 text-xs text-gray-500">적립일: {formatDate(transaction.created_at)}</p>
                    {transaction.posts?.title && (
                      <Link href={`/board/${transaction.post_id || transaction.posts.id}`} className="mt-2 inline-flex text-xs font-semibold text-slate-600 transition-colors hover:text-slate-800 hover:underline">
                        {transaction.posts.title}
                      </Link>
                    )}
                  </div>
                  <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">+{transaction.points}P</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {pointTransactions.length >= limit && (
          <div className="mt-3 text-center">
            <Link href={`/mypage/points?limit=${limit + 20}`} className="text-sm font-semibold text-slate-500 transition-colors hover:text-slate-700 hover:underline">
              포인트 내역 더보기
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
