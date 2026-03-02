'use client';

import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

/** 로그아웃 버튼 컴포넌트 */
export default function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/'); // 로그인 페이지로 이동
        router.refresh(); // 서버 캐시 초기화
    };

    return (
        <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-gray-500 hover:text-red-600 transition-colors w-full p-2 rounded-lg hover:bg-red-50"
        >
            <LogOut size={20} />
            <span className="font-medium">로그아웃</span>
        </button>
    );
}
