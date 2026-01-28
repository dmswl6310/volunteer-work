'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ClipboardList, User } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  // Hide on login/signup/root pages
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
      href: '/reviews', // User said "Review Board", assuming /reviews route, need to create or verify
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
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-6 pb-safe z-50">
      <div className="max-w-md mx-auto flex justify-between items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = tab.isActive;
          return (
            <Link 
              key={tab.name} 
              href={tab.href}
              className={`flex flex-col items-center space-y-1 ${
                active ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'
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
