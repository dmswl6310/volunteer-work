import Link from 'next/link';
import { getMyApplicationsPageData } from '@/actions/user';
import CancelApplicationButton from '@/components/CancelApplicationButton';
import StatusBadge from '@/components/StatusBadge';

function formatDate(dateValue?: string | null) {
  return dateValue ? new Date(dateValue).toLocaleDateString() : '-';
}

export default async function MyPagePage() {
  const { activeApplications, completedActivities } = await getMyApplicationsPageData();
  const visibleActiveApplications = activeApplications.slice(0, 5);
  const visibleCompletedActivities = completedActivities.slice(0, 5);

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-900">내 신청</h2>
          <Link href="/mypage/applications" className="text-xs font-semibold text-teal-600 hover:underline">
            전체보기
          </Link>
        </div>

        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-bold text-gray-800">[진행 중인 신청]</p>
            {visibleActiveApplications.length === 0 ? (
              <div className="rounded-xl bg-gray-50 px-4 py-5 text-center text-sm text-gray-400">진행 중인 신청이 없습니다.</div>
            ) : (
              <div className="space-y-2">
                {visibleActiveApplications.map((application) => (
                  <div key={application.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <Link href={`/board/${application.post_id || application.postId}`} className="block truncate font-bold text-gray-900 hover:text-teal-600">
                          {application.posts?.title || '알 수 없는 게시글'}
                        </Link>
                        <p className="mt-1 text-xs text-gray-500">신청일: {formatDate(application.created_at || application.createdAt)}</p>
                      </div>
                      <StatusBadge status={application.status} />
                    </div>
                    {application.status === 'pending' && (
                      <div className="mt-3 flex justify-end">
                        <CancelApplicationButton applicationId={application.id} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="mb-2 text-sm font-bold text-gray-800">[참여 완료]</p>
            {visibleCompletedActivities.length === 0 ? (
              <div className="rounded-xl bg-gray-50 px-4 py-5 text-center text-sm text-gray-400">참여 완료된 활동이 없습니다.</div>
            ) : (
              <div className="space-y-2">
                {visibleCompletedActivities.map((application) => (
                  <Link key={application.id} href={`/board/${application.post_id || application.postId}`} className="block rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:border-teal-200">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold text-gray-900">{application.posts?.title || '알 수 없는 게시글'}</p>
                        <p className="mt-1 text-xs text-gray-500">진행일: {formatDate(application.posts?.due_date)}</p>
                      </div>
                      <span className="text-gray-400">›</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
