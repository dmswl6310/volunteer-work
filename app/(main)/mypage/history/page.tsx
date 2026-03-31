import Link from 'next/link';
import { getMyHistoryPageData } from '@/actions/user';

function parseLimit(limit?: string) {
  const parsed = Number(limit);
  if (!Number.isFinite(parsed) || parsed <= 0) return 10;
  return Math.min(parsed, 50);
}

function formatDate(dateValue?: string | null) {
  return dateValue ? new Date(dateValue).toLocaleDateString() : '-';
}

export default async function MyHistoryPage({ searchParams }: { searchParams?: Promise<{ limit?: string }> }) {
  const params = await searchParams;
  const limit = parseLimit(params?.limit);
  const { completedActivities, scraps, reviews, pointTransactions } = await getMyHistoryPageData(limit);
  const visibleCompletedActivities = completedActivities.slice(0, limit);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">관심/기록</h2>
        <p className="mt-1 text-sm text-gray-500">참여 완료 활동, 관심 봉사활동, 포인트 내역, 작성한 후기를 한 번에 모아볼 수 있어요.</p>
      </section>

      <section>
        <h3 className="text-base font-bold text-gray-900 mb-3 px-1">완료된 활동</h3>
        {completedActivities.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center text-sm text-gray-400 shadow-sm">완료된 활동이 없습니다.</div>
        ) : (
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm divide-y divide-gray-100">
            {visibleCompletedActivities.map((application) => (
              <Link key={application.id} href={`/board/${application.post_id || application.postId}`} className="block p-4 hover:bg-gray-50">
                <p className="font-bold text-gray-900">{application.posts?.title || '알 수 없는 게시글'}</p>
                <p className="mt-1 text-xs text-gray-500">진행일: {formatDate(application.posts?.due_date)}</p>
              </Link>
            ))}
          </div>
        )}
        {completedActivities.length > limit && (
          <div className="mt-3 text-center">
            <Link href={`/mypage/history?limit=${limit + 10}`} className="text-sm font-semibold text-teal-600 hover:underline">
              완료된 활동 더보기
            </Link>
          </div>
        )}
      </section>

      <section>
        <h3 className="text-base font-bold text-gray-900 mb-3 px-1">포인트 내역</h3>
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
                      <Link href={`/board/${transaction.post_id || transaction.posts.id}`} className="mt-2 inline-flex text-xs font-semibold text-teal-600 hover:underline">
                        {transaction.posts.title}
                      </Link>
                    )}
                  </div>
                  <span className="shrink-0 text-base font-extrabold text-teal-600">+{transaction.points}P</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {pointTransactions.length >= limit && (
          <div className="mt-3 text-center">
            <Link href={`/mypage/history?limit=${limit + 10}`} className="text-sm font-semibold text-teal-600 hover:underline">
              포인트 내역 더보기
            </Link>
          </div>
        )}
      </section>

      <section>
        <h3 className="text-base font-bold text-gray-900 mb-3 px-1">관심 봉사활동</h3>
        {scraps.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center text-sm text-gray-400 shadow-sm">찜한 활동이 없습니다.</div>
        ) : (
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm divide-y divide-gray-100">
            {scraps.map((scrap) => (
              <Link key={scrap.id} href={`/board/${scrap.post_id || scrap.posts?.id}`} className="block p-4 hover:bg-gray-50">
                <p className="font-bold text-gray-900">{scrap.posts?.title || '알 수 없는 게시글'}</p>
                <p className="mt-1 text-xs text-gray-500">찜한 날짜: {formatDate(scrap.created_at || scrap.createdAt)}</p>
              </Link>
            ))}
          </div>
        )}
        {scraps.length >= limit && (
          <div className="mt-3 text-center">
            <Link href={`/mypage/history?limit=${limit + 10}`} className="text-sm font-semibold text-teal-600 hover:underline">
              관심 봉사활동 더보기
            </Link>
          </div>
        )}
      </section>

      <section>
        <h3 className="text-base font-bold text-gray-900 mb-3 px-1">내가 쓴 후기</h3>
        {reviews.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center text-sm text-gray-400 shadow-sm">작성한 후기가 없습니다.</div>
        ) : (
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm divide-y divide-gray-100">
            {reviews.map((review) => (
              <div key={review.id} className="p-4">
                <p className="font-bold text-gray-900">{review.posts?.title || '삭제된 게시글'}</p>
                <p className="mt-2 text-sm text-gray-600 line-clamp-3">{review.content}</p>
                <p className="mt-2 text-xs text-gray-500">작성일: {formatDate(review.created_at || review.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
        {reviews.length >= limit && (
          <div className="mt-3 text-center">
            <Link href={`/mypage/history?limit=${limit + 10}`} className="text-sm font-semibold text-teal-600 hover:underline">
              내가 쓴 후기 더보기
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
