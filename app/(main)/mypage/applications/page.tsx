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

export default async function MyApplicationsPage({ searchParams }: { searchParams?: Promise<{ section?: string; limit?: string }> }) {
  const params = await searchParams;
  const section = params?.section === 'completed' ? 'completed' : 'active';
  const limit = parseLimit(params?.limit);
  const { activeApplications, completedActivities } = await getMyApplicationsPageData();
  const visibleItems = (section === 'completed' ? completedActivities : activeApplications).slice(0, limit);
  const totalCount = section === 'completed' ? completedActivities.length : activeApplications.length;

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Applications</p>
            <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-slate-900">
              {section === 'completed' ? '참여 완료 활동' : '진행 중인 신청'}
            </h2>
          </div>
          <Link href="/mypage" className="text-xs font-semibold text-teal-600 hover:underline">
            내 신청으로 돌아가기
          </Link>
        </div>

        <div className="mb-4 flex gap-2">
          <Link
            href="/mypage/applications?section=active&limit=10"
            className={`rounded-full px-3 py-1.5 text-sm font-semibold ${section === 'active' ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            진행 중인 신청
          </Link>
          <Link
            href="/mypage/applications?section=completed&limit=10"
            className={`rounded-full px-3 py-1.5 text-sm font-semibold ${section === 'completed' ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            참여 완료
          </Link>
        </div>

        {visibleItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-6 text-center text-sm text-slate-400">
            {section === 'completed' ? '참여 완료된 활동이 없습니다.' : '진행 중인 신청이 없습니다.'}
          </div>
        ) : (
          <div className="space-y-2.5">
            {section === 'active'
              ? visibleItems.map((application) => (
                  <div key={application.id} className="rounded-2xl border border-slate-200 bg-slate-50/40 p-4 transition-colors hover:border-slate-300 hover:bg-white">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <Link href={`/board/${application.post_id || application.postId}`} className="block truncate text-[15px] font-semibold text-slate-900 transition-colors hover:text-teal-700">
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
                ))
              : visibleItems.map((application) => (
                  <Link key={application.id} href={`/board/${application.post_id || application.postId}`} className="block rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-teal-200 hover:bg-slate-50/40">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-semibold text-slate-900">{application.posts?.title || '알 수 없는 게시글'}</p>
                        <p className="mt-1 text-xs text-slate-500">진행일 · {formatDate(application.posts?.due_date)}</p>
                      </div>
                      <span className="text-slate-400">›</span>
                    </div>
                  </Link>
                ))}
          </div>
        )}

        {totalCount > limit && (
          <div className="mt-4 text-center">
            <Link href={`/mypage/applications?section=${section}&limit=${limit + 10}`} className="text-sm font-semibold text-teal-600 hover:underline">
              더보기
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
