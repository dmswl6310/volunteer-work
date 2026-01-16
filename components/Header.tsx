'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Header() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // 2. Listen for auth changes
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
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-bold text-xl text-indigo-600 tracking-tight">
          Together
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-6 text-sm font-medium text-gray-600">
          <Link href="/board" className="hover:text-indigo-600 transition">
            봉사활동 찾기
          </Link>
          {session && (
             <Link href="/board/write" className="hover:text-indigo-600 transition">
                봉사 모집하기
             </Link>
          )}
        </div>

        {/* Auth Buttons */}
        <div className="flex space-x-3 text-sm font-medium">
          {session ? (
            <>
              <Link 
                href="/mypage" 
                className="px-3 py-1.5 rounded-full bg-gray-50 text-gray-700 hover:bg-gray-100 transition"
              >
                마이페이지
              </Link>
              <button 
                onClick={handleLogout}
                className="px-3 py-1.5 text-gray-500 hover:text-red-600 transition"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/auth/login" 
                className="px-4 py-1.5 rounded-full text-indigo-600 hover:bg-indigo-50 transition"
              >
                로그인
              </Link>
              <Link 
                href="/auth/signup" 
                className="px-4 py-1.5 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition"
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
