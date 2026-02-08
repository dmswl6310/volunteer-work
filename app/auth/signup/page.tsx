'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nickname: '', // Maps to username in DB
    contact: '',
    address: '',
    job: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic validation
    if (!formData.email || !formData.password || !formData.nickname || !formData.contact || !formData.address || !formData.job) {
      setError('모든 필드를 입력해주세요.');
      setLoading(false);
      return;
    }

    try {
        // 1. SignUp with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
                data: {
                    username: formData.nickname,
                }
            }
        });

        if (authError) throw authError;

        if (authData.user) {
            // 2. Create DB Record via Server Action
            // Import dynamically or assume it's available (needs 'use client' so we must import server action)
            // But we can't import server action directly in some setups without passing it down? 
            // Next.js App Router supports importing server actions in client components.
            const { createUserRecord } = await import('@/actions/auth');
            
            const result = await createUserRecord({
                id: authData.user.id,
                email: formData.email,
                username: formData.nickname, // Nickname as unique username
                name: formData.nickname, // Use nickname for name as well, or we could ask for real name. User said "Nickname" is required.
                contact: formData.contact,
                address: formData.address,
                job: formData.job
            });

            if (!result.success) {
                throw new Error(result.error);
            }

            // 3. Force SignOut (Require Admin Approval)
            await supabase.auth.signOut();

            alert('회원가입 요청이 완료되었습니다.\n관리자 승인 후 로그인하실 수 있습니다.');
            router.push('/'); 
        }
    } catch (err: any) {
      if (err.message?.includes('User already registered') || err.message?.includes('already registered')) {
        setError('이미 가입된 이메일입니다. <a href="/" class="underline font-bold">로그인하기</a>');
      } else {
        console.error(err);
        setError(err.message || '회원가입 실패');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 pb-20">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">회원가입</h2>
          <p className="mt-2 text-sm text-gray-600">
            관리자 승인 후 이용 가능합니다.
          </p>
        </div>
        <form className="mt-8 space-y-4" onSubmit={handleSignup}>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">이메일 (아이디)</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">비밀번호</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">닉네임</label>
            <input
              id="nickname"
              name="nickname"
              type="text"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.nickname}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="contact" className="block text-sm font-medium text-gray-700">연락처</label>
            <input
              id="contact"
              name="contact"
              type="text"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.contact}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">주소</label>
            <input
              id="address"
              name="address"
              type="text"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="job" className="block text-sm font-medium text-gray-700">직업</label>
            <input
              id="job"
              name="job"
              type="text"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.job}
              onChange={handleChange}
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center" dangerouslySetInnerHTML={{__html: error}} />
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? '가입 처리 중...' : '가입하기'}
            </button>
          </div>

          <div className="text-center text-sm">
            <Link href="/" className="font-medium text-indigo-600 hover:text-indigo-500">
              이미 계정이 있으신가요? 로그인
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
