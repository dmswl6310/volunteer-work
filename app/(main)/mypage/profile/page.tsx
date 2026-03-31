import { getMyProfileData } from '@/actions/user';
import ProfileEditForm from '@/components/ProfileEditForm';
import LogoutButton from '@/components/LogoutButton';

export default async function MyProfilePage() {
  const profile = await getMyProfileData();

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">프로필</h2>
        <p className="mt-1 text-sm text-gray-500">연락처, 주소, 직업을 수정하고 계정 정보를 관리할 수 있어요.</p>
      </section>

      <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <ProfileEditForm user={profile} />
        <div className="mt-6 border-t border-gray-100 pt-4">
          <LogoutButton />
        </div>
      </section>
    </div>
  );
}
