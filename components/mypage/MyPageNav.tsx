'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClipboardList, FolderOpen, ShieldCheck } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/mypage', label: '내 신청', icon: ClipboardList, match: ['/mypage', '/mypage/applications'] },
  { href: '/mypage/hosting', label: '주최 관리', icon: ShieldCheck },
  { href: '/mypage/history', label: '관심/기록', icon: FolderOpen },
];

export default function MyPageNav() {
  const pathname = usePathname();

  return (
    <nav className="rounded-2xl border border-gray-100 bg-white p-1 shadow-sm overflow-x-auto">
      <div className="flex min-w-max gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.match ? item.match.includes(pathname) : pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-teal-500 text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-teal-600'
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
