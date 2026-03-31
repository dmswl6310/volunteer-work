'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ClipboardList, User } from 'lucide-react';

/** 하단 탭 네비게이션 컴포넌트 (모바일 하단 고정) */
export default function BottomNav() {
  const pathname = usePathname();

  // 로그인/회원가입/루트 페이지에서는 숨김
  const isAuthPage = pathname === '/' || pathname.startsWith('/auth');
  const isAdminPage = pathname.startsWith('/admin');

  if (isAuthPage || isAdminPage) {
    return null;
  }

  const tabs = [
    {
      name: '봉사활동',
      href: '/board',
      icon: Home,
      isActive: pathname.startsWith('/board')
    },
    {
      name: '후기',
      href: '/reviews',
      icon: ClipboardList,
      isActive: pathname.startsWith('/reviews')
    },
    {
      name: '내 정보',
      href: '/mypage',
      icon: User,
      isActive: pathname.startsWith('/mypage')
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#f6f7f8] px-4 py-3 pb-safe">
      <div className="mx-auto flex max-w-md items-center justify-between rounded-3xl border border-gray-100 bg-white px-6 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = tab.isActive;
          return (
            <Link 
              key={tab.name} 
              href={tab.href}
              className={`touch-feedback flex flex-col items-center space-y-1 rounded-2xl px-3 py-1 transition-colors ${
                active ? 'bg-teal-50 text-teal-600' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Icon size={24} strokeWidth={active ? 2.5 : 2} />
              <span className="text-xs font-medium">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
