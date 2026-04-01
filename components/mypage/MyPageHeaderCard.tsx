import Link from 'next/link';
import { CircleUserRound, PencilLine } from 'lucide-react';
import { getMyProfileData } from '@/actions/user';
import LogoutButton from '@/components/LogoutButton';

export default async function MyPageHeaderCard() {
  const profile = await getMyProfileData();

  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white px-5 py-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600">
          <CircleUserRound className="h-7 w-7" />
        </div>
        <div className="min-w-0 flex-1 space-y-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Account</p>
            <div className="mt-1 flex flex-wrap items-center gap-2.5">
              <p className="text-xl font-semibold tracking-[-0.02em] text-slate-900">{profile.username}</p>
              <Link href="/mypage/points" className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-3.5 py-1.5 text-sm font-bold text-indigo-700 transition-colors hover:bg-indigo-100/90">
                <span className="mr-1.5 text-[11px] font-semibold text-indigo-500">포인트</span>
                <span>{profile.points.toLocaleString()}P</span>
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-3">
            <Link
              href="/mypage/profile"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-500 transition-colors hover:border-indigo-200 hover:bg-indigo-50/60 hover:text-indigo-700"
            >
              <PencilLine className="h-3 w-3" />
              <span>프로필 편집</span>
            </Link>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-1.5 py-1 text-[11px] font-medium text-slate-500">
              <LogoutButton variant="compact" />
            </div>
          </div>
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
