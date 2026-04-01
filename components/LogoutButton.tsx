'use client';

import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

interface LogoutButtonProps {
    variant?: 'default' | 'compact';
}

/** 로그아웃 버튼 컴포넌트 */
export default function LogoutButton({ variant = 'default' }: LogoutButtonProps) {
    const router = useRouter();
    const isCompact = variant === 'compact';

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/'); // 로그인 페이지로 이동
        router.refresh(); // 서버 캐시 초기화
    };

    return (
        <button
            onClick={handleLogout}
            className={`flex w-full items-center rounded-lg text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 ${
                isCompact ? 'gap-1.5 px-2 py-1 text-[11px]' : 'space-x-2 p-2'
            }`}
        >
            <LogOut size={isCompact ? 14 : 20} />
            <span className={isCompact ? 'font-semibold' : 'font-medium'}>로그아웃</span>
        </button>
    );
}
