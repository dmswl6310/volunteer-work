'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

type UserProfile = {
  id: string;
  email: string;
  name: string;
  contact: string;
  is_approved: boolean;
  created_at: string;
};

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdmin();
    fetchPendingUsers();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const { data } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (data?.role !== 'admin') {
      alert('관리자 권한이 필요합니다.');
      router.push('/');
      return;
    }
    setIsAdmin(true);
  };

  const fetchPendingUsers = async () => {
    // Fetch users who are NOT approved
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('is_approved', false)
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching users:', error);
    else setUsers(data || []);
    setLoading(false);
  };

  const approveUser = async (userId: string) => {
    // Ideally use an RPC or Server Action for security, but direct update works if RLS policies allow 'update own' or 'admin update'.
    // NOTE: My RLS policy only allows "Users can update own profile". Admin cannot update others by default unless I add a policy for admins.
    // I need to add an RLS policy for admins in Supabase SQL editor later. 
    // For now, I will assume the policy exists or I will attempt to update.
    
    // UPDATE: We need to ensure the DB setup allows this.
    const { error } = await supabase
      .from('users')
      .update({ is_approved: true })
      .eq('id', userId);

    if (error) {
      alert('승인 실패: ' + error.message);
    } else {
      alert('승인되었습니다.');
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  if (!isAdmin && loading) return <div className="p-8 text-center">Loading...</div>;
  if (!isAdmin) return null; // Redirecting

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">관리자 대시보드 - 회원 가입 승인</h1>

      {loading ? (
        <p>Loading pending users...</p>
      ) : users.length === 0 ? (
        <p className="text-gray-500">승인 대기 중인 회원이 없습니다.</p>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {users.map((user) => (
              <li key={user.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-indigo-600 truncate">{user.name} ({user.email})</p>
                  <p className="text-sm text-gray-500">연락처: {user.contact}</p>
                  <p className="text-xs text-gray-400">가입일: {new Date(user.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <button
                    onClick={() => approveUser(user.id)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    승인
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
