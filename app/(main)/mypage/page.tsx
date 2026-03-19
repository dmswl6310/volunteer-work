import { createServerSupabaseClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getMyPageData } from '@/actions/user';
import MyPageTabs from '@/components/MyPageTabs';

export default async function MyPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    redirect('/auth/login');
  }

  let user;
  try {
    user = await getMyPageData(
      authUser.id,
      authUser.email,
      authUser.user_metadata?.name
    );
  } catch (error) {
    console.error('Failed to load user data:', error);
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-gray-500">
        <p>내 정보를 불러오는 데 실패했습니다.</p>
        <p className="text-sm mt-2">잠시 후 다시 시도해 주세요.</p>
      </div>
    );
  }

  if (!user) return null;

  // 들어온 신청 목록 (대기 중인 것만 표시)
  const incomingRequests = user.posts.flatMap((p: any) =>
    p.applications
      .filter((app: any) => app.status === 'pending')
      .map((app: any) => ({ ...app, post: p }))
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-gray-200 sticky top-0 z-30">
        <h1 className="text-lg font-bold text-center">내 정보</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* 프로필 카드 (항상 보임) */}
        <section className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl">
              {user.name?.[0] || 'U'}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900">
                {user.name && user.name !== 'User' ? user.name : user.username}
              </h2>
              <p className="text-gray-500 text-sm">@{user.username}</p>
            </div>
          </div>

          {/* 포인트 */}
          <div className="flex justify-between items-center text-sm bg-indigo-50 p-3 rounded-xl border border-indigo-100">
            <span className="font-bold text-indigo-900">내 포인트</span>
            <span className="font-bold text-indigo-600 text-lg">{user.points} P</span>
          </div>

          {/* 관리자 */}
          {user.role === 'admin' && (
            <Link href="/admin" className="block w-full py-3 mt-4 bg-indigo-600 text-white font-bold text-center rounded-xl shadow-md hover:bg-indigo-700 transition-colors">
              관리자 대시보드 접속
            </Link>
          )}
        </section>

        {/* 탭 영역 */}
        <MyPageTabs user={user} incomingRequests={incomingRequests} />
      </div>
    </div>
  );
}
