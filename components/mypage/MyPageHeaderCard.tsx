import Link from 'next/link';
import { CircleUserRound, Coins, PencilLine } from 'lucide-react';
import { getMyProfileData } from '@/actions/user';
import LogoutButton from '@/components/LogoutButton';

export default async function MyPageHeaderCard() {
  const profile = await getMyProfileData();

  return (
    <section className="rounded-[28px] border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-600">
          <CircleUserRound className="h-8 w-8" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-bold text-gray-900">{profile.username}</p>
          <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
            <Coins className="h-3.5 w-3.5" />
            <span>내 포인트: {profile.points.toLocaleString()} P</span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link
          href="/mypage/profile"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-semibold text-gray-700 hover:border-indigo-200 hover:text-indigo-600"
        >
          <PencilLine className="h-4 w-4" />
          <span>프로필 편집</span>
        </Link>
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-semibold text-gray-700">
          <LogoutButton />
        </div>
      </div>

      {profile.role === 'admin' && (
        <Link
          href="/admin"
          className="mt-2 block rounded-xl bg-indigo-600 px-4 py-2.5 text-center text-sm font-bold text-white hover:bg-indigo-700"
        >
          관리자 대시보드
        </Link>
      )}
    </section>
  );
}
