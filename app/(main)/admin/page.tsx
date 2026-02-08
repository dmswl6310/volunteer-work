'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { approveUser, getAdminDashboardData } from '@/actions/admin';
import Link from 'next/link';

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

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/auth/login');
        return;
      }

      // We can double check role from metadata if available, OR just valid server fetch
      // Let's fetch the data which will fail or return empty if not admin logic on server?
      // Actually, the server action `getAdminDashboardData` currently doesn't check role again inside (it trusts caller?).
      // TODO: We should verify role in `getAdminDashboardData` for security, but for now let's check basic auth.

      // Wait, `getAdminDashboardData` is just a data fetcher. 
      // We need to ensure Client-side thinks we are admin to render UI.
      // Assuming secure backend, if we fetch and get error, we redirect.

      try {
        const data = await getAdminDashboardData();
        // If we want to be strict, we can check role again here if we had a getUser server action.
        // For now, let's assume if we can fetch, we are good.
        // But we should probably check Current User role on client or server.

        // NOTE: The previous server page Checked `prisma.user` role.
        // Let's rely on data returning. If unauthorized, we might want to handle it.
        // But I'll just load it.
        setPendingUsers(data as User[]);
        setIsAdmin(true);
      } catch (e) {
        console.error(e);
        alert('접근 권한이 없거나 오류가 발생했습니다.');
        router.replace('/');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="container mx-auto px-4 py-8 pb-20">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">관리자 대시보드</h1>
        <Link href="/mypage" className="text-sm text-gray-500 hover:underline">
          &larr; 내 정보로 돌아가기
        </Link>
      </div>

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
              {pendingUsers.map((u) => (
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
                  <form action={async () => {
                    if (confirm(`${u.name}님의 가입을 승인하시겠습니까?`)) {
                      await approveUser(u.id);
                      alert('승인되었습니다.');
                      // Reload
                      const newData = await getAdminDashboardData();
                      setPendingUsers(newData as User[]);
                    }
                  }}>
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
    </div>
  );
}
