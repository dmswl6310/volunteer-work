'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '', // ID(Account)
    email: '',
    password: '',
    name: '',
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
    if (!formData.username || !formData.address || !formData.job) {
         setError('모든 필드를 입력해주세요.');
         setLoading(false);
         return;
    }

    try {
      // 1. Sign up with Supabase Auth (using email)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Create Public User Record
        const { error: dbError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: formData.email,
            username: formData.username,
            name: formData.name,
            contact: formData.contact,
            address: formData.address,
            job: formData.job,
            role: 'user',
            is_approved: false,
          });

        if (dbError) {
            console.error('DB Error:', dbError);
            if (dbError.code === '23505') { // Unique violation
                if (dbError.message.includes('username')) throw new Error('이미 사용 중인 아이디입니다.');
                if (dbError.message.includes('email')) throw new Error('이미 가입된 이메일입니다.');
            }
            throw new Error('계정 정보 저장 중 오류가 발생했습니다.');
        }

        alert('회원가입 요청이 완료되었습니다. 관리자 승인 후 로그인 가능합니다.');
        router.push('/'); // Redirect to Login (which is now root)
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || '회원가입 실패');
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
            필수 정보를 모두 입력해주세요.
          </p>
        </div>
        <form className="mt-8 space-y-4" onSubmit={handleSignup}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">아이디 (계정)</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.username}
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
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">이름</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.name}
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
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">SNS (E-mail)</label>
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
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? '가입 처리 중...' : '가입완료'}
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
