import prisma from '@/lib/prisma';
import { supabase } from '@/lib/supabase';
import { approveUser } from '@/actions/admin';
import { redirect } from 'next/navigation';

interface User {
  id: string;
  email: string;
  username?: string;
  name: string | null;
  contact: string | null;
  address?: string | null;
  job?: string | null;
  createdAt: Date;
}

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  // Check Auth & Role
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) redirect('/');

  const currentUser = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { role: true }
  });

  if (currentUser?.role !== 'admin') {
      redirect('/board');
  }

  // 1. Fetch pending users
  const pendingUsers = await prisma.user.findMany({
    where: { isApproved: false },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="container mx-auto px-4 py-8 pb-20">
      <h1 className="text-3xl font-bold mb-8">관리자 대시보드</h1>

      {/* User Approval Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">가입 승인 대기 회원 ({pendingUsers.length})</h2>
        {pendingUsers.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center text-gray-500 shadow-sm border border-gray-100">
              대기 중인 회원이 없습니다.
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {pendingUsers.map((user: unknown) => {
                const u = user as User;
                return (
                <li key={u.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                         <span className="font-bold text-lg">{u.name || '이름 없음'}</span>
                         <span className="text-gray-500 text-sm">({u.username || 'ID 없음'})</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                        <p>이메일: {u.email}</p>
                        <p>연락처: {u.contact}</p>
                        <p>주소: {u.address}</p>
                        <p>직업: {u.job}</p>
                        <p>가입신청: {new Date(u.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <form action={approveUser.bind(null, u.id)}>
                    <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-bold shadow-sm transition-colors whitespace-nowrap">
                      가입 승인
                    </button>
                  </form>
                </li>
              );})}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
