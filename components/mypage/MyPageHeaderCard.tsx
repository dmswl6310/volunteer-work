import Link from 'next/link';
import { CircleUserRound, Coins, PencilLine } from 'lucide-react';
import { getMyProfileData } from '@/actions/user';
import LogoutButton from '@/components/LogoutButton';

export default async function MyPageHeaderCard() {
  const profile = await getMyProfileData();

  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white px-5 py-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600">
          <CircleUserRound className="h-7 w-7" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">My account</p>
          <p className="mt-1 text-xl font-semibold tracking-[-0.02em] text-slate-900">{profile.username}</p>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50/80 px-3 py-1 text-xs font-semibold text-indigo-700">
            <Coins className="h-3.5 w-3.5" />
            <span>{profile.points.toLocaleString()} P</span>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2.5">
        <Link
          href="/mypage/profile"
          className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-indigo-200 hover:bg-indigo-50/60 hover:text-indigo-700"
        >
          <PencilLine className="h-4 w-4" />
          <span>프로필 편집</span>
        </Link>
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-3 py-3 text-sm font-semibold text-slate-700">
          <LogoutButton />
        </div>
      </div>

      {profile.role === 'admin' && (
        <Link
          href="/admin"
          className="mt-2.5 block rounded-2xl bg-indigo-600 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          관리자 대시보드
        </Link>
      )}
    </section>
  );
}
