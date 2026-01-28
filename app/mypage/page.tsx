import { supabase } from '@/lib/supabase';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import IncomingRequestItem from '@/components/IncomingRequestItem';
import CancelApplicationButton from '@/components/CancelApplicationButton';

export const dynamic = 'force-dynamic';

export default async function MyPage() {
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    redirect('/');
  }

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    include: {
      applications: {
        include: { post: true },
        orderBy: { createdAt: 'desc' },
      },
      postScraps: {
        include: { post: true },
        orderBy: { createdAt: 'desc' },
      },
      posts: {
        orderBy: { createdAt: 'desc' },
        include: {
            applications: {
                where: { status: 'pending' },
                include: { user: true }
            }
        }
      },
      reviews: {
        include: { post: true },
        orderBy: { createdAt: 'desc' }
      }
    },
  });

  if (!user) {
    return <div>로그인이 필요합니다.</div>;
  }

  // Aggregate incoming requests
  const incomingRequests = user.posts.flatMap(p => p.applications.map(app => ({...app, post: p})));

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-gray-200 sticky top-0 z-30">
          <h1 className="text-lg font-bold text-center">내 정보</h1>
      </div>

      <div className="p-4 space-y-6">
          {/* Profile Section */}
          <section className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-2xl">
                {user.name?.[0] || 'U'}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">{user.name} <span className="text-sm font-normal text-gray-500">({user.role === 'admin' ? '관리자' : '일반회원'})</span></h2>
                <p className="text-gray-500 text-sm">{user.email}</p>
                {user.role === 'admin' && (
                     <Link href="/admin" className="text-xs text-indigo-600 font-bold underline mt-1 block">관리자 페이지 이동</Link>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-xl">
                <div>
                    <span className="block text-gray-500 text-xs">연락처</span>
                    <span className="font-medium">{user.contact}</span>
                </div>
                 <div>
                    <span className="block text-gray-500 text-xs">포인트</span>
                    <span className="font-bold text-indigo-600">{user.points} P</span>
                </div>
                 <div>
                    <span className="block text-gray-500 text-xs">직업</span>
                    <span className="font-medium">{user.job || '-'}</span>
                </div>
                 <div>
                    <span className="block text-gray-500 text-xs">주소</span>
                    <span className="font-medium truncate">{user.address || '-'}</span>
                </div>
            </div>
          </section>

          {/* Incoming Requests (For Organizers) */}
          {incomingRequests.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-2 px-1">
                    <h2 className="text-lg font-bold text-indigo-900">신청 승인 대기 <span className="text-red-500 text-sm">({incomingRequests.length})</span></h2>
                </div>
                <div className="space-y-3">
                    {incomingRequests.map(app => (
                        <IncomingRequestItem key={app.id} application={app} />
                    ))}
                </div>
              </section>
          )}

          {/* My Applications */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3 px-1">참여 신청 내역</h2>
             {user.applications.length === 0 ? (
                 <div className="bg-white rounded-xl p-6 text-center text-gray-400 text-sm">신청한 활동이 없습니다.</div>
             ) : (
                 <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
                    {user.applications.map(app => (
                        <div key={app.id} className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-gray-800">{app.post.title}</h3>
                                <StatusBadge status={app.status} />
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-xs text-gray-500">{new Date(app.createdAt).toLocaleDateString()} 신청</span>
                                {app.status === 'pending' && <CancelApplicationButton applicationId={app.id} />}
                                {app.status === 'approved' && (
                                     <Link href={`/reviews/write/${app.postId}`} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded font-bold">후기작성</Link>
                                )}
                            </div>
                        </div>
                    ))}
                 </div>
             )}
          </section>

          {/* My Posts */}
          <section>
             <h2 className="text-lg font-bold text-gray-900 mb-3 px-1">내가 올린 글</h2>
             {user.posts.length === 0 ? (
                 <div className="bg-white rounded-xl p-6 text-center text-gray-400 text-sm">작성한 게시글이 없습니다.</div>
             ) : (
                 <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                    {user.posts.map(post => (
                        <Link key={post.id} href={`/board/${post.id}`} className="min-w-[200px] bg-white p-4 rounded-xl shadow-sm border border-gray-100 block">
                            <h3 className="font-bold text-sm truncate mb-1">{post.title}</h3>
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>{post.currentParticipants}/{post.maxParticipants}명</span>
                                <span>{post.isRecruiting ? '모집중' : '마감'}</span>
                            </div>
                        </Link>
                    ))}
                 </div>
             )}
          </section>

          {/* Scraps */}
          <section>
             <h2 className="text-lg font-bold text-gray-900 mb-3 px-1">관심 봉사활동</h2>
             {user.postScraps.length === 0 ? (
                 <div className="bg-white rounded-xl p-6 text-center text-gray-400 text-sm">찜한 활동이 없습니다.</div>
             ) : (
                 <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
                    {user.postScraps.map(scrap => (
                        <Link key={scrap.id} href={`/board/${scrap.post.id}`} className="block p-4 hover:bg-gray-50">
                             <h3 className="font-bold text-gray-800">{scrap.post.title}</h3>
                             <p className="text-xs text-gray-400 mt-1">{new Date(scrap.createdAt).toLocaleDateString()} 찜함</p>
                        </Link>
                    ))}
                 </div>
             )}
          </section>

           {/* My Reviews */}
           <section>
             <h2 className="text-lg font-bold text-gray-900 mb-3 px-1">내가 쓴 후기</h2>
             {user.reviews.length === 0 ? (
                 <div className="bg-white rounded-xl p-6 text-center text-gray-400 text-sm">작성한 후기가 없습니다.</div>
             ) : (
                 <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
                    {user.reviews.map(review => (
                        <div key={review.id} className="p-4">
                             <h3 className="font-bold text-sm mb-1">{review.post?.title || '삭제된 게시글'}</h3>
                             <p className="text-sm text-gray-600 line-clamp-2">{review.content}</p>
                             <span className="text-xs text-gray-400 mt-2 block">{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                    ))}
                 </div>
             )}
          </section>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    confirmed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };

  const labels: any = {
    pending: '대기',
    approved: '승인',
    rejected: '반려',
    confirmed: '완료',
    cancelled: '취소',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold ${styles[status] || 'bg-gray-100'}`}>
      {labels[status] || status}
    </span>
  );
}
