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
      <section className="rounded-3xl border border-slate-200/80 bg-white px-5 py-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Applications</p>
            <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-slate-900">내 신청</h2>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-800">진행 중인 신청</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">{activeApplications.length}건</span>
                {activeApplications.length > 5 && (
                  <Link href="/mypage/applications?section=active&limit=10" className="text-xs font-semibold text-teal-600 hover:underline">
                    더보기
                  </Link>
                )}
              </div>
            </div>
            {visibleActiveApplications.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-6 text-center text-sm text-slate-400">진행 중인 신청이 없습니다.</div>
            ) : (
              <div className="space-y-2.5">
                {visibleActiveApplications.map((application) => (
                  <div key={application.id} className="rounded-2xl border border-slate-200 bg-slate-50/40 p-4 transition-colors hover:border-slate-300 hover:bg-white">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <Link href={`/board/${application.post_id || application.postId}`} className="block truncate text-[15px] font-semibold text-slate-900 transition-colors hover:text-indigo-700">
                          {application.posts?.title || '알 수 없는 게시글'}
                        </Link>
                        <p className="mt-1 text-xs text-slate-500">신청일 · {formatDate(application.created_at || application.createdAt)}</p>
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

          <div className="space-y-3 border-t border-slate-100 pt-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-800">참여 완료</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">{completedActivities.length}건</span>
                {completedActivities.length > 5 && (
                  <Link href="/mypage/applications?section=completed&limit=10" className="text-xs font-semibold text-teal-600 hover:underline">
                    더보기
                  </Link>
                )}
              </div>
            </div>
            {visibleCompletedActivities.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-6 text-center text-sm text-slate-400">참여 완료된 활동이 없습니다.</div>
            ) : (
              <div className="space-y-2.5">
                {visibleCompletedActivities.map((application) => (
                  <div key={application.id} className="rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-indigo-200 hover:bg-slate-50/40">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <Link href={`/board/${application.post_id || application.postId}`} className="block truncate text-[15px] font-semibold text-slate-900 transition-colors hover:text-indigo-700">
                          {application.posts?.title || '알 수 없는 게시글'}
                        </Link>
                        <p className="mt-1 text-xs text-slate-500">진행일 · {formatDate(application.posts?.due_date)}</p>
                      </div>
                      <span className="text-slate-400">›</span>
                    </div>
                    <div className="mt-3 flex justify-end">
                      {application.hasReview ? (
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                          후기 작성 완료
                        </span>
                      ) : (
                        <Link href={`/reviews/write/${application.post_id || application.postId}`} className="rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-700">
                          후기쓰기
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
