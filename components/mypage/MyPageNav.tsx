'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClipboardList, FolderOpen, LayoutDashboard, Settings, ShieldCheck } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/mypage', label: '개요', icon: LayoutDashboard },
  { href: '/mypage/applications', label: '내 신청', icon: ClipboardList },
  { href: '/mypage/hosting', label: '주최 관리', icon: ShieldCheck },
  { href: '/mypage/history', label: '기록', icon: FolderOpen },
  { href: '/mypage/profile', label: '프로필', icon: Settings },
];

export default function MyPageNav() {
  const pathname = usePathname();

  return (
    <nav className="overflow-x-auto pb-1">
      <div className="flex gap-2 min-w-max">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-indigo-200 hover:text-indigo-600'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
