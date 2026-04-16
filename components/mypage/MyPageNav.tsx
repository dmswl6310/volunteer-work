'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClipboardList, FolderOpen, Settings, ShieldCheck } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/mypage', label: '신청 관리', icon: ClipboardList, match: ['/mypage', '/mypage/applications'] },
  { href: '/mypage/hosting', label: '주최 관리', icon: ShieldCheck },
  { href: '/mypage/history', label: '관심/기록', icon: FolderOpen },
  { href: '/mypage/settings', label: '설정', icon: Settings, match: ['/mypage/settings', '/mypage/profile', '/mypage/support/new'] },
];

export default function MyPageNav() {
  const pathname = usePathname();

  return (
    <nav className="rounded-3xl border border-slate-200/80 bg-white p-1.5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <div className="grid grid-cols-4 gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.match ? item.match.includes(pathname) : pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-0 items-center justify-center gap-1 rounded-2xl px-2 py-2.5 text-[13px] font-semibold transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-[0_8px_18px_rgba(79,70,229,0.22)]'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="min-w-0 truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
