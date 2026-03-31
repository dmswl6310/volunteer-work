import type { ReactNode } from 'react';
import MyPageHeaderCard from '@/components/mypage/MyPageHeaderCard';
import MyPageNav from '@/components/mypage/MyPageNav';

export default function MyPageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50/70 pb-24">
      <div className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur">
        <h1 className="text-base font-semibold tracking-[-0.01em] text-slate-900 text-center">마이페이지</h1>
      </div>

      <div className="mx-auto w-full max-w-md p-4 space-y-4">
        <div className="sticky top-[61px] z-20 space-y-3 bg-slate-50/95 pb-2 backdrop-blur">
          <MyPageHeaderCard />
          <MyPageNav />
        </div>
        {children}
      </div>
    </div>
  );
}
