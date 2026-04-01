import { getMyProfileData } from '@/actions/user';
import ProfileEditForm from '@/components/ProfileEditForm';
import LogoutButton from '@/components/LogoutButton';

export default async function MyProfilePage() {
  const profile = await getMyProfileData();

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-slate-200/80 bg-white px-5 py-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">내 프로필</p>
        <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-slate-900">내 정보</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">연락처, 주소, 직업을 수정하고 계정 정보를 관리할 수 있어요.</p>
      </section>

      <section className="rounded-3xl border border-slate-200/80 bg-white px-5 py-6 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
        <ProfileEditForm user={profile} />
        <div className="mt-8 border-t border-slate-100 pt-5">
          <LogoutButton />
        </div>
      </section>
    </div>
  );
}
