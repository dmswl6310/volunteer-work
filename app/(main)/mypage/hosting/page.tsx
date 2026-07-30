import Link from 'next/link';
import { getMyHostingPageData } from '@/actions/user';
import AttendanceConfirmationCard from '@/components/AttendanceConfirmationCard';
import IncomingRequestItem from '@/components/IncomingRequestItem';
import { getPostStatus } from '@/lib/post-status';
import { requireApprovedPageUser } from '@/lib/page-auth';

function parseLimit(limit?: string) {
  const parsed = Number(limit);
  if (!Number.isFinite(parsed) || parsed <= 0) return 8;
  return Math.min(parsed, 40);
}

type HostingTab = 'requests' | 'attendance' | 'posts';

function parseTab(tab?: string): HostingTab {
  if (tab === 'attendance' || tab === 'posts') return tab;
  return 'requests';
}

export default async function MyHostingPage({ searchParams }: { searchParams?: Promise<{ limit?: string; tab?: string }> }) {
  await requireApprovedPageUser('/mypage/hosting');
  const params = await searchParams;
  const limit = parseLimit(params?.limit);
  const tab = parseTab(params?.tab);
  const { incomingRequests, attendancePosts, hostedPosts } = await getMyHostingPageData();
  const visibleIncomingRequests = incomingRequests.slice(0, limit);
  const visibleAttendancePosts = attendancePosts.slice(0, limit);
  const visibleHostedPosts = hostedPosts.slice(0, limit);

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-slate-200/80 bg-white px-5 py-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Hosting</p>
            <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-slate-900">주최 관리</h2>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
            총 {incomingRequests.length + attendancePosts.length + hostedPosts.length}건
          </span>
        </div>

        <div className="mt-4 rounded-2xl bg-slate-100/80 p-1.5">
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          <Link
            href="/mypage/hosting?tab=requests&limit=8"
            className={`whitespace-nowrap rounded-2xl px-3 py-2 text-sm font-semibold transition-all ${tab === 'requests' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:bg-white/70 hover:text-slate-700'}`}
          >
            신청 승인 {incomingRequests.length > 0 && `(${incomingRequests.length})`}
          </Link>
          <Link
            href="/mypage/hosting?tab=attendance&limit=8"
            className={`whitespace-nowrap rounded-2xl px-3 py-2 text-sm font-semibold transition-all ${tab === 'attendance' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:bg-white/70 hover:text-slate-700'}`}
          >
            참여 확인 {attendancePosts.length > 0 && `(${attendancePosts.length})`}
          </Link>
          <Link
            href="/mypage/hosting?tab=posts&limit=8"
            className={`whitespace-nowrap rounded-2xl px-3 py-2 text-sm font-semibold transition-all ${tab === 'posts' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:bg-white/70 hover:text-slate-700'}`}
          >
            내가 올린 글 {hostedPosts.length > 0 && `(${hostedPosts.length})`}
          </Link>
          </div>
        </div>
      </section>

      {tab === 'requests' && (
        <section>
          <div className="mb-3 flex items-center justify-between px-1">
            <h3 className="text-base font-semibold text-slate-900">신청 승인 대기</h3>
            <span className="text-sm text-slate-400">{incomingRequests.length}건</span>
          </div>
          {incomingRequests.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-400 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">승인을 기다리는 요청이 없습니다.</div>
          ) : (
            <div className="space-y-3">
              {visibleIncomingRequests.map((application) => (
                <IncomingRequestItem key={application.id} application={application} />
              ))}
            </div>
          )}
          {incomingRequests.length > limit && (
            <div className="mt-3 text-center">
              <Link href={`/mypage/hosting?tab=requests&limit=${limit + 8}`} className="text-sm font-semibold text-slate-500 transition-colors hover:text-slate-700 hover:underline">
                승인 요청 더보기
              </Link>
            </div>
          )}
        </section>
      )}

      {tab === 'attendance' && (
        <section>
          <div className="mb-3 flex items-center justify-between px-1">
            <h3 className="text-base font-semibold text-slate-900">참여 확인 및 포인트 지급</h3>
            <span className="text-sm text-slate-400">{attendancePosts.length}개 게시글</span>
          </div>
          {attendancePosts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-400 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">참여 확인이 필요한 게시글이 없습니다.</div>
          ) : (
            <div className="space-y-3">
              {visibleAttendancePosts.map((post) => (
                <AttendanceConfirmationCard
                  key={post.id}
                  postId={post.id}
                  title={post.title}
                  dueDate={post.due_date}
                  volunteerHours={post.volunteer_hours ?? 1}
                  approvedApplications={post.applications.filter((application) => application.status === 'approved')}
                />
              ))}
            </div>
          )}
          {attendancePosts.length > limit && (
            <div className="mt-3 text-center">
              <Link href={`/mypage/hosting?tab=attendance&limit=${limit + 8}`} className="text-sm font-semibold text-slate-500 transition-colors hover:text-slate-700 hover:underline">
                참여 확인 게시글 더보기
              </Link>
            </div>
          )}
        </section>
      )}

      {tab === 'posts' && (
        <section>
          <div className="mb-3 flex items-center justify-between px-1">
            <h3 className="text-base font-semibold text-slate-900">내가 올린 글</h3>
            <span className="text-sm text-slate-400">{hostedPosts.length}건</span>
          </div>
          {hostedPosts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-400 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">작성한 게시글이 없습니다.</div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {visibleHostedPosts.map((post) => {
                const status = getPostStatus({
                  dueDate: post.due_date,
                  isRecruiting: post.is_recruiting,
                  currentParticipants: post.current_participants,
                  maxParticipants: post.max_participants,
                });
                const statusLabel = status.isOpenRecruiting
                  ? '모집중'
                  : status.isFull && !status.isExpired && post.is_recruiting
                    ? '모집 완료'
                    : '마감';

                return (
                  <Link key={post.id} href={`/board/${post.id}`} className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.04)] transition-all hover:border-slate-300 hover:bg-slate-50/40">
                    <h4 className="whitespace-normal break-words font-semibold leading-snug text-slate-900 [word-break:keep-all]">{post.title}</h4>
                    <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                      <span>{post.current_participants}/{post.max_participants}명</span>
                      <span className={status.isOpenRecruiting ? 'font-semibold text-amber-600' : 'font-semibold text-slate-500'}>
                        {statusLabel}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
          {hostedPosts.length > limit && (
            <div className="mt-3 text-center">
              <Link href={`/mypage/hosting?tab=posts&limit=${limit + 8}`} className="text-sm font-semibold text-slate-500 transition-colors hover:text-slate-700 hover:underline">
                내가 올린 글 더보기
              </Link>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
