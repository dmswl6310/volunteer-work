import Link from 'next/link';
import { getMyApplicationsPageData } from '@/actions/user';
import CancelApplicationButton from '@/components/CancelApplicationButton';
import StatusBadge from '@/components/StatusBadge';

function parseLimit(limit?: string) {
  const parsed = Number(limit);
  if (!Number.isFinite(parsed) || parsed <= 0) return 10;
  return Math.min(parsed, 50);
}

function formatDate(dateValue?: string | null) {
  return dateValue ? new Date(dateValue).toLocaleDateString() : '-';
}

export default async function MyApplicationsPage({ searchParams }: { searchParams?: Promise<{ limit?: string }> }) {
  const params = await searchParams;
  const limit = parseLimit(params?.limit);
  const { activeApplications, completedActivities } = await getMyApplicationsPageData();
  const visibleActiveApplications = activeApplications.slice(0, limit);
  const visibleCompletedActivities = completedActivities.slice(0, limit);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">내 신청</h2>
        <p className="mt-1 text-sm text-gray-500">진행 중인 신청과 완료된 활동을 나눠서 확인할 수 있어요.</p>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-base font-bold text-gray-900">진행 중인 신청</h3>
          <span className="text-sm text-gray-400">{activeApplications.length}건</span>
        </div>
        {activeApplications.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center text-sm text-gray-400 shadow-sm">진행 중인 신청이 없습니다.</div>
        ) : (
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm divide-y divide-gray-100">
            {visibleActiveApplications.map((application) => (
              <div key={application.id} className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <Link href={`/board/${application.post_id || application.postId}`} className="font-bold text-gray-900 hover:text-indigo-600">
                    {application.posts?.title || '알 수 없는 게시글'}
                  </Link>
                  <StatusBadge status={application.status} />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-gray-500">신청일: {formatDate(application.created_at || application.createdAt)}</p>
                  {application.status === 'pending' && <CancelApplicationButton applicationId={application.id} />}
                </div>
              </div>
            ))}
          </div>
        )}
        {activeApplications.length > limit && (
          <div className="mt-3 text-center">
            <Link href={`/mypage/applications?limit=${limit + 10}`} className="text-sm font-semibold text-indigo-600 hover:underline">
              진행 중인 신청 더보기
            </Link>
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-base font-bold text-gray-900">참여 완료 활동</h3>
          <span className="text-sm text-gray-400">{completedActivities.length}건</span>
        </div>
        {completedActivities.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center text-sm text-gray-400 shadow-sm">완료된 활동이 없습니다.</div>
        ) : (
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm divide-y divide-gray-100">
            {visibleCompletedActivities.map((application) => (
              <div key={application.id} className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <Link href={`/board/${application.post_id || application.postId}`} className="font-bold text-gray-900 hover:text-indigo-600">
                    {application.posts?.title || '알 수 없는 게시글'}
                  </Link>
                  <Link href={`/reviews/write/${application.post_id || application.postId}`} className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-100">
                    후기 작성
                  </Link>
                </div>
                <p className="text-xs text-gray-500">진행일: {formatDate(application.posts?.due_date)}</p>
              </div>
            ))}
          </div>
        )}
        {completedActivities.length > limit && (
          <div className="mt-3 text-center">
            <Link href={`/mypage/applications?limit=${limit + 10}`} className="text-sm font-semibold text-indigo-600 hover:underline">
              참여 완료 활동 더보기
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
