import Link from 'next/link';
import { getMyPageOverviewData } from '@/actions/user';
import AttendanceConfirmationCard from '@/components/AttendanceConfirmationCard';
import IncomingRequestItem from '@/components/IncomingRequestItem';

function OverviewLinkCard({ href, title, description, count, countLabel }: { href: string; title: string; description: string; count: number; countLabel: string }) {
  return (
    <Link href={href} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
        <div className="shrink-0 rounded-xl bg-indigo-50 px-3 py-2 text-right">
          <p className="text-lg font-extrabold text-indigo-600">{count}</p>
          <p className="text-[11px] text-indigo-400">{countLabel}</p>
        </div>
      </div>
    </Link>
  );
}

export default async function MyPageOverviewPage() {
  const { profile, counts, previews } = await getMyPageOverviewData();

  return (
    <div className="space-y-4">
      <section className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl">
            {profile.username?.[0] || 'U'}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900">{profile.username}</h2>
            <p className="text-sm text-gray-500">지금 필요한 업무와 기록을 한눈에 확인할 수 있어요.</p>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm bg-indigo-50 p-3 rounded-xl border border-indigo-100">
          <span className="font-bold text-indigo-900">내 포인트</span>
          <span className="font-bold text-indigo-600 text-lg">{profile.points} P</span>
        </div>

        {profile.role === 'admin' && (
          <Link href="/admin" className="block w-full py-3 mt-4 bg-indigo-600 text-white font-bold text-center rounded-xl shadow-md hover:bg-indigo-700 transition-colors">
            관리자 대시보드 접속
          </Link>
        )}
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <OverviewLinkCard href="/mypage/applications" title="내 신청" description="현재 신청 상태와 참여 완료 활동을 관리합니다." count={counts.pendingApplications} countLabel="건 대기중" />
        <OverviewLinkCard href="/mypage/hosting" title="주최 관리" description="신청 승인과 참여 확인, 내가 올린 글을 확인합니다." count={counts.pendingIncomingRequests + counts.attendanceActions} countLabel="건 확인 필요" />
        <OverviewLinkCard href="/mypage/history" title="기록" description="완료 활동, 찜한 봉사활동, 작성한 후기를 모아봅니다." count={counts.completedActivities} countLabel="개 완료" />
        <OverviewLinkCard href="/mypage/profile" title="프로필" description="연락처, 주소, 직업을 수정하고 계정을 관리합니다." count={counts.reviews + counts.scraps} countLabel="기록 보관" />
      </section>

      {previews.incomingRequests.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base font-bold text-gray-900">바로 처리할 승인 요청</h3>
            <Link href="/mypage/hosting" className="text-sm font-semibold text-indigo-600">전체 보기</Link>
          </div>
          {previews.incomingRequests.map((application) => (
            <IncomingRequestItem key={application.id} application={application} />
          ))}
        </section>
      )}

      {previews.attendancePosts.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base font-bold text-gray-900">참여 확인 및 포인트 지급</h3>
            <Link href="/mypage/hosting" className="text-sm font-semibold text-indigo-600">전체 보기</Link>
          </div>
          {previews.attendancePosts.map((post) => (
            <AttendanceConfirmationCard
              key={post.id}
              postId={post.id}
              title={post.title}
              dueDate={post.due_date}
              volunteerHours={post.volunteer_hours ?? 1}
              approvedApplications={post.applications.filter((application) => application.status === 'approved')}
            />
          ))}
        </section>
      )}

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900">내 신청 미리보기</h3>
            <Link href="/mypage/applications" className="text-sm font-semibold text-indigo-600">더보기</Link>
          </div>
          {previews.applications.length === 0 ? (
            <p className="text-sm text-gray-400">진행 중인 신청이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {previews.applications.map((application) => (
                <Link key={application.id} href={`/board/${application.post_id || application.postId}`} className="block rounded-xl bg-gray-50 p-3 hover:bg-gray-100 transition-colors">
                  <p className="font-semibold text-gray-900">{application.posts?.title || '알 수 없는 게시글'}</p>
                  <p className="mt-1 text-xs text-gray-500">상태: {application.status}</p>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900">최근 완료 활동</h3>
            <Link href="/mypage/history" className="text-sm font-semibold text-indigo-600">더보기</Link>
          </div>
          {previews.completedActivities.length === 0 ? (
            <p className="text-sm text-gray-400">아직 완료된 활동이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {previews.completedActivities.map((application) => (
                <Link key={application.id} href={`/board/${application.post_id || application.postId}`} className="block rounded-xl bg-gray-50 p-3 hover:bg-gray-100 transition-colors">
                  <p className="font-semibold text-gray-900">{application.posts?.title || '알 수 없는 게시글'}</p>
                  <p className="mt-1 text-xs text-gray-500">진행일: {application.posts?.due_date ? new Date(application.posts.due_date).toLocaleDateString() : '-'}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
