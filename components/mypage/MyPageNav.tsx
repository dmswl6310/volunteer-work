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
      <div className="grid grid-cols-2 gap-1 sm:grid-cols-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.match ? item.match.includes(pathname) : pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-[44px] min-w-0 items-center justify-center gap-1.5 rounded-2xl px-2 py-2.5 text-center text-[13px] font-semibold leading-snug transition-colors ${
                isActive
                  ? 'bg-amber-600 text-white shadow-[0_8px_18px_rgba(217,119,6,0.22)]'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="whitespace-normal break-words [word-break:keep-all]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
