import type { ReactNode } from 'react';
import MyPageNav from '@/components/mypage/MyPageNav';

export default function MyPageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      <div className="bg-white px-4 py-3 border-b border-gray-200 sticky top-0 z-30">
        <h1 className="text-lg font-bold text-center">내 정보</h1>
      </div>

      <div className="p-4 space-y-4">
        <MyPageNav />
        {children}
      </div>
    </div>
  );
}
