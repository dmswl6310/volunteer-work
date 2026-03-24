import Link from 'next/link';
import { redirect } from 'next/navigation';
import { approveUser, getAdminDashboardData } from '@/actions/admin';
import IncomingRequestItem from '@/components/IncomingRequestItem';
import { requireAdminUser } from '@/lib/server-auth';

export default async function AdminPage() {
  try {
    await requireAdminUser();
  } catch {
    redirect('/mypage');
  }

  const { pendingUsers, pendingApplications } = await getAdminDashboardData();

  return (
    <div className="container mx-auto px-4 py-8 pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
          <p className="mt-1 text-sm text-gray-500">회원 승인과 봉사 신청 현황을 한 곳에서 관리합니다.</p>
        </div>
        <Link href="/mypage" className="text-sm text-gray-500 hover:underline">
          &larr; 내 정보로 돌아가기
        </Link>
      </div>

      <div className="space-y-8">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">가입 승인 대기 회원</h2>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-600">
              {pendingUsers.length}명
            </span>
          </div>

          {pendingUsers.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center text-gray-500 shadow-sm border border-gray-100">
              대기 중인 회원이 없습니다.
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-100">
              <ul className="divide-y divide-gray-200">
                {pendingUsers.map((user) => (
                  <li key={user.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-gray-900">{user.name || '이름 없음'}</span>
                        <span className="text-gray-500 text-sm">({user.username || 'ID 없음'})</span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                        <p>이메일: {user.email}</p>
                        <p>연락처: {user.contact || '-'}</p>
                        <p>주소: {user.address || '-'}</p>
                        <p>직업/소속기관: {user.job || '-'}</p>
                        <p>가입신청: {new Date(user.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <form action={approveUser.bind(null, user.id)}>
                      <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-bold shadow-sm transition-colors whitespace-nowrap">
                        가입 승인
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">봉사 신청 승인 대기</h2>
            <span className="rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-red-500">
              {pendingApplications.length}건
            </span>
          </div>

          {pendingApplications.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center text-gray-500 shadow-sm border border-gray-100">
              대기 중인 봉사 신청이 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingApplications.map((application) => (
                <IncomingRequestItem key={application.id} application={{ ...application, post: application.post ?? { title: '알 수 없는 게시글' } }} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
