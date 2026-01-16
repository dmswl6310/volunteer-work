import prisma from '@/lib/prisma';
import { approveUser, approveApplication, rejectApplication } from '@/actions/admin';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  // 1. Fetch pending users
  const pendingUsers = await prisma.user.findMany({
    where: { isApproved: false },
    orderBy: { createdAt: 'desc' },
  });

  // 2. Fetch pending applications
  const pendingApplications = await prisma.application.findMany({
    where: { status: 'pending' },
    include: {
      user: true,
      post: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">관리자 대시보드</h1>

      {/* User Approval Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">가입 승인 대기 회원 ({pendingUsers.length})</h2>
        {pendingUsers.length === 0 ? (
          <p className="text-gray-500">대기 중인 회원이 없습니다.</p>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {pendingUsers.map((user) => (
                <li key={user.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{user.name || '이름 없음'}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <p className="text-xs text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                  <form action={approveUser.bind(null, user.id)}>
                    <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 font-medium">
                      승인
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Application Approval Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">봉사활동 신청 대기 ({pendingApplications.length})</h2>
        {pendingApplications.length === 0 ? (
          <p className="text-gray-500">대기 중인 신청이 없습니다.</p>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {pendingApplications.map((app) => (
                <li key={app.id} className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{app.post.title}</h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>신청자: <span className="font-medium text-black">{app.user.name}</span> ({app.user.email})</p>
                        <p>연락처: {app.user.contact || '없음'}</p>
                        <p>신청일: {new Date(app.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <form action={approveApplication.bind(null, app.id)}>
                        <button className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 font-bold shadow-sm transition-colors">
                          승인
                        </button>
                      </form>
                      <form action={rejectApplication.bind(null, app.id)}>
                        <button className="bg-red-100 text-red-600 px-5 py-2.5 rounded-lg hover:bg-red-200 font-bold transition-colors">
                          거절
                        </button>
                      </form>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
