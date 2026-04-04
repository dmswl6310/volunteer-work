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
    <nav className="overflow-x-auto rounded-3xl border border-slate-200/80 bg-white p-1.5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <div className="flex min-w-max gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.match ? item.match.includes(pathname) : pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex min-w-[104px] shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-[0_8px_18px_rgba(79,70,229,0.22)]'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
