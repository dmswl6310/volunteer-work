import { supabase } from '@/lib/supabase';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function MyPage() {
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    redirect('/auth/login');
  }

  // Fetch full user data including applications and scraps
  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    include: {
      applications: {
        include: {
          post: true,
        },
        orderBy: { createdAt: 'desc' },
      },
      postScraps: {
        include: {
          post: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!user) {
    return <div>User not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <h1 className="text-2xl font-bold mb-6">마이페이지</h1>

      {/* Profile Section */}
      <section className="bg-white rounded-xl p-6 shadow-sm mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-2xl">
            {user.name?.[0] || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-gray-500">{user.email}</p>
            <p className="text-sm text-gray-400 mt-1">
              가입일: {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </section>

      {/* Applications Section */}
      <section className="mb-10">
        <h2 className="text-lg font-bold mb-4">내 신청 내역</h2>
        {user.applications.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-xl text-gray-500">
            <p>아직 신청한 봉사활동이 없습니다.</p>
            <Link href="/board" className="text-indigo-600 font-bold mt-2 inline-block">
              봉사활동 찾아보기
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {user.applications.map((app) => (
              <div key={app.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg mb-1">{app.post.title}</h3>
                    <p className="text-sm text-gray-500 mb-3">
                      신청일: {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex items-center space-x-2">
                       <StatusBadge status={app.status} />
                    </div>
                  </div>
                </div>
                
                {app.status === 'approved' && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <Link 
                      href={`/reviews/write/${app.postId}`}
                      className="block w-full text-center bg-indigo-50 text-indigo-600 font-bold py-2 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      후기 작성하기
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Scraps Section */}
      <section>
        <h2 className="text-lg font-bold mb-4">찜한 봉사활동</h2>
        {user.postScraps.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl text-gray-500">
            <p>찜한 활동이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.postScraps.map((scrap) => (
              <Link key={scrap.id} href={`/board/${scrap.postId}`} className="block">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <h3 className="font-bold text-gray-900 truncate">{scrap.post.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(scrap.createdAt).toLocaleDateString()} 찜함
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    confirmed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };

  const labels = {
    pending: '대기중',
    approved: '승인됨',
    rejected: '거절됨',
    confirmed: '활동완료',
    cancelled: '취소됨',
  };

  const statusKey = status as keyof typeof styles;
  
  return (
    <span className={`px-2 py-1 rounded text-xs font-bold ${styles[statusKey] || 'bg-gray-100'}`}>
      {labels[statusKey] || status}
    </span>
  );
}
