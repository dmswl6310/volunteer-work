import Link from 'next/link';
import { getMyHistoryPageData } from '@/actions/user';

function parseLimit(limit?: string) {
  const parsed = Number(limit);
  if (!Number.isFinite(parsed) || parsed <= 0) return 10;
  return Math.min(parsed, 50);
}

function buildHistoryHref({ completedLimit, scrapLimit, reviewLimit }: { completedLimit: number; scrapLimit: number; reviewLimit: number }) {
  return `/mypage/history?completedLimit=${completedLimit}&scrapLimit=${scrapLimit}&reviewLimit=${reviewLimit}`;
}

function formatDate(dateValue?: string | null) {
  return dateValue ? new Date(dateValue).toLocaleDateString() : '-';
}

export default async function MyHistoryPage({
  searchParams,
}: {
  searchParams?: Promise<{ completedLimit?: string; scrapLimit?: string; reviewLimit?: string }>;
}) {
  const params = await searchParams;
  const completedLimit = parseLimit(params?.completedLimit);
  const scrapLimit = parseLimit(params?.scrapLimit);
  const reviewLimit = parseLimit(params?.reviewLimit);
  const { completedActivities, scraps, reviews } = await getMyHistoryPageData({
    completedLimit,
    scrapLimit,
    reviewLimit,
  });

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-slate-200/80 bg-white px-5 py-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Activity archive</p>
        <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-slate-900">관심/기록</h2>
      </section>

      <section>
        <h3 className="mb-3 px-1 text-base font-semibold text-slate-900">완료된 활동</h3>
        {completedActivities.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-400 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">완료된 활동이 없습니다.</div>
        ) : (
          <div className="rounded-3xl border border-slate-200/80 bg-white shadow-[0_10px_26px_rgba(15,23,42,0.04)] divide-y divide-slate-100">
            {completedActivities.map((application) => (
              <Link key={application.id} href={`/board/${application.post_id || application.postId}`} className="block p-4 transition-colors hover:bg-slate-50/70">
                <p className="whitespace-normal break-words font-semibold leading-snug text-slate-900 [word-break:keep-all]">{application.posts?.title || '알 수 없는 게시글'}</p>
                <p className="mt-1 text-xs text-slate-500">진행일 · {formatDate(application.posts?.due_date)}</p>
              </Link>
            ))}
          </div>
        )}
        {completedActivities.length >= completedLimit && (
          <div className="mt-3 text-center">
            <Link
              href={buildHistoryHref({ completedLimit: completedLimit + 10, scrapLimit, reviewLimit })}
              className="text-sm font-semibold text-slate-500 transition-colors hover:text-slate-700 hover:underline"
            >
              완료된 활동 더보기
            </Link>
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-3 px-1 text-base font-semibold text-slate-900">관심 봉사활동</h3>
        {scraps.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-400 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">찜한 활동이 없습니다.</div>
        ) : (
          <div className="rounded-3xl border border-slate-200/80 bg-white shadow-[0_10px_26px_rgba(15,23,42,0.04)] divide-y divide-slate-100">
            {scraps.map((scrap) => (
              <Link key={scrap.id} href={`/board/${scrap.post_id || scrap.posts?.id}`} className="block p-4 transition-colors hover:bg-slate-50/70">
                <p className="whitespace-normal break-words font-semibold leading-snug text-slate-900 [word-break:keep-all]">{scrap.posts?.title || '알 수 없는 게시글'}</p>
                <p className="mt-1 text-xs text-slate-500">찜한 날짜 · {formatDate(scrap.created_at || scrap.createdAt)}</p>
              </Link>
            ))}
          </div>
        )}
        {scraps.length >= scrapLimit && (
          <div className="mt-3 text-center">
            <Link
              href={buildHistoryHref({ completedLimit, scrapLimit: scrapLimit + 10, reviewLimit })}
              className="text-sm font-semibold text-slate-500 transition-colors hover:text-slate-700 hover:underline"
            >
              관심 봉사활동 더보기
            </Link>
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-3 px-1 text-base font-semibold text-slate-900">내가 쓴 후기</h3>
        {reviews.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-400 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">작성한 후기가 없습니다.</div>
        ) : (
          <div className="rounded-3xl border border-slate-200/80 bg-white shadow-[0_10px_26px_rgba(15,23,42,0.04)] divide-y divide-slate-100">
            {reviews.map((review) => (
              <div key={review.id} className="p-4">
                <p className="whitespace-normal break-words font-semibold leading-snug text-slate-900 [word-break:keep-all]">{review.posts?.title || '삭제된 게시글'}</p>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-600 [word-break:keep-all]">{review.content}</p>
                <p className="mt-2 text-xs text-slate-500">작성일 · {formatDate(review.created_at || review.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
        {reviews.length >= reviewLimit && (
          <div className="mt-3 text-center">
            <Link
              href={buildHistoryHref({ completedLimit, scrapLimit, reviewLimit: reviewLimit + 10 })}
              className="text-sm font-semibold text-slate-500 transition-colors hover:text-slate-700 hover:underline"
            >
              내가 쓴 후기 더보기
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
