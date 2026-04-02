'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

/** 상단 네비게이션 헤더 컴포넌트 (데스크톱 표시, 로그인 상태 관리) */
export default function Header() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // 1. 초기 세션 가져오기
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // 2. 인증 상태 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (_event === 'SIGNED_OUT') {
        router.push('/');
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        {/* 로고 */}
        <Link href="/" className="text-xl font-semibold tracking-[-0.02em] text-indigo-600">
          사과
        </Link>

        {/* 데스크톱 네비게이션 */}
        <div className="hidden space-x-6 text-sm font-medium text-slate-600 md:flex">
          <Link href="/board" className="transition hover:text-indigo-600">
            봉사활동 찾기
          </Link>
          {session && (
            <Link href="/board/write" className="transition hover:text-indigo-600">
              봉사 모집하기
            </Link>
          )}
        </div>

        {/* 인증 버튼 */}
        <div className="flex space-x-3 text-sm font-medium">
          {session ? (
            <>
              <Link
                href="/mypage"
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50/60 hover:text-indigo-700"
              >
                마이페이지
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-slate-500 transition hover:text-rose-600"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="rounded-full px-4 py-1.5 text-indigo-600 transition hover:bg-indigo-50"
              >
                로그인
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-full bg-indigo-600 px-4 py-1.5 text-white shadow-[0_8px_20px_rgba(79,70,229,0.18)] transition hover:bg-indigo-700"
              >
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
