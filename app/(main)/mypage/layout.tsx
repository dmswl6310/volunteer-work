import type { ReactNode } from 'react';
import MyPageHeaderCard from '@/components/mypage/MyPageHeaderCard';
import MyPageNav from '@/components/mypage/MyPageNav';

export default function MyPageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-[#f6f7f8] min-h-screen pb-24">
      <div className="bg-white px-4 py-3 border-b border-gray-200 sticky top-0 z-30">
        <h1 className="text-base font-bold text-center">마이페이지</h1>
      </div>

      <div className="mx-auto w-full max-w-md p-4 space-y-4">
        <div className="sticky top-[61px] z-20 space-y-3 bg-[#f6f7f8] pb-1">
          <MyPageHeaderCard />
          <MyPageNav />
        </div>
        {children}
      </div>
    </div>
  );
}
