'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PromoCarousel from '@/components/PromoCarousel';
import { getSafeReturnTo } from '@/lib/auth-navigation';
import { ArrowLeft } from 'lucide-react';


export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleBack = () => {
    const requestedBackPath = new URLSearchParams(window.location.search).get('back');
    router.push(getSafeReturnTo(requestedBackPath));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
        return;
      }

      if (data.user) {
        // Query user info directly using the client-side supabase instance
        const { data: userRecord, error: userError } = await supabase
          .from('users')
          .select('is_approved, role')
          .eq('id', data.user.id)
          .maybeSingle();

        if (userError || !userRecord) {
          await supabase.auth.signOut();
          setError('등록되지 않은 사용자이거나 삭제된 계정입니다. 관리자에게 문의해주세요.');
          return;
        }

        if (!userRecord.is_approved) {
          await supabase.auth.signOut();
          setError('관리자 승인 대기 중입니다. 승인 후 이용 가능합니다.');
          return;
        }

        const requestedPath = new URLSearchParams(window.location.search).get('next');
        router.replace(getSafeReturnTo(requestedPath));
        router.refresh();
      }
    } catch (err: unknown) {
      console.error(err);
      setError('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="relative max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg">
        <button
          type="button"
          onClick={handleBack}
          aria-label="이전 화면으로 돌아가기"
          className="absolute left-5 top-5 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <div className="mb-6">
            <PromoCarousel />
          </div>
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900">로그인</h2>
          <p className="mt-2 text-sm text-gray-600">
            신청과 활동 등록은 로그인 후 이용할 수 있어요.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">이메일</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                placeholder="이메일 주소"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">비밀번호</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 transition-colors"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </div>

          <div className="text-center text-sm">
            <Link href="/auth/signup" className="font-medium text-amber-600 hover:text-amber-500">
              계정이 없으신가요? 회원가입
            </Link>
          </div>

          <div className="border-t border-slate-200 pt-5 text-center">
            <Link
              href="/board"
              className="text-sm font-medium text-slate-500 underline decoration-slate-300 underline-offset-4 transition-colors hover:text-amber-700"
            >
              로그인 없이 둘러보기
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
