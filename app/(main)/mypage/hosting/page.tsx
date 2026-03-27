import Link from 'next/link';
import { getMyHostingPageData } from '@/actions/user';
import AttendanceConfirmationCard from '@/components/AttendanceConfirmationCard';
import IncomingRequestItem from '@/components/IncomingRequestItem';

function parseLimit(limit?: string) {
  const parsed = Number(limit);
  if (!Number.isFinite(parsed) || parsed <= 0) return 8;
  return Math.min(parsed, 40);
}

export default async function MyHostingPage({ searchParams }: { searchParams?: Promise<{ limit?: string }> }) {
  const params = await searchParams;
  const limit = parseLimit(params?.limit);
  const { incomingRequests, attendancePosts, hostedPosts } = await getMyHostingPageData();
  const visibleIncomingRequests = incomingRequests.slice(0, limit);
  const visibleAttendancePosts = attendancePosts.slice(0, limit);
  const visibleHostedPosts = hostedPosts.slice(0, limit);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">주최 관리</h2>
        <p className="mt-1 text-sm text-gray-500">신청 승인, 참여 확인, 내가 올린 글을 분리해서 관리할 수 있어요.</p>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-base font-bold text-gray-900">신청 승인 대기</h3>
          <span className="text-sm text-gray-400">{incomingRequests.length}건</span>
        </div>
        {incomingRequests.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center text-sm text-gray-400 shadow-sm">승인을 기다리는 요청이 없습니다.</div>
        ) : (
          <div className="space-y-3">
            {visibleIncomingRequests.map((application) => (
              <IncomingRequestItem key={application.id} application={application} />
            ))}
          </div>
        )}
        {incomingRequests.length > limit && (
          <div className="mt-3 text-center">
            <Link href={`/mypage/hosting?limit=${limit + 8}`} className="text-sm font-semibold text-indigo-600 hover:underline">
              승인 요청 더보기
            </Link>
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-base font-bold text-gray-900">참여 확인 및 포인트 지급</h3>
          <span className="text-sm text-gray-400">{attendancePosts.length}개 게시글</span>
        </div>
        {attendancePosts.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center text-sm text-gray-400 shadow-sm">참여 확인이 필요한 게시글이 없습니다.</div>
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
            <Link href={`/mypage/hosting?limit=${limit + 8}`} className="text-sm font-semibold text-indigo-600 hover:underline">
              참여 확인 게시글 더보기
            </Link>
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-base font-bold text-gray-900">내가 올린 글</h3>
          <span className="text-sm text-gray-400">{hostedPosts.length}건</span>
        </div>
        {hostedPosts.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center text-sm text-gray-400 shadow-sm">작성한 게시글이 없습니다.</div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {visibleHostedPosts.map((post) => (
              <Link key={post.id} href={`/board/${post.id}`} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all">
                <h4 className="font-bold text-gray-900 truncate">{post.title}</h4>
                <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                  <span>{post.current_participants}/{post.max_participants}명</span>
                  <span>{post.is_recruiting ? '모집중' : '마감'}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
        {hostedPosts.length > limit && (
          <div className="mt-3 text-center">
            <Link href={`/mypage/hosting?limit=${limit + 8}`} className="text-sm font-semibold text-indigo-600 hover:underline">
              내가 올린 글 더보기
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
