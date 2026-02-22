'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import IncomingRequestItem from '@/components/IncomingRequestItem';
import CancelApplicationButton from '@/components/CancelApplicationButton';
import LogoutButton from '@/components/LogoutButton';
import { getMyPageData } from '@/actions/user';
import { updateUserProfile } from '@/actions/user-update';

export default function MyPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    contact: '',
    address: '',
    job: ''
  });

  // Load initial form data when user loads
  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || '',
        contact: user.contact || '',
        address: user.address || '',
        job: user.job || ''
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm('프로필을 수정하시겠습니까?')) return;

    try {
      await updateUserProfile(user.id, editForm);
      alert('프로필이 수정되었습니다.');
      setIsEditing(false);
      // Reload data
      window.location.reload();
    } catch (error: any) {
      alert(error.message);
    }
  };

  useEffect(() => {
    async function loadData() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        // Not logged in
        router.push('/auth/login');
        return;
      }

      try {
        // Call Server Action
        const userData = await getMyPageData(
          authUser.id,
          authUser.email,
          authUser.user_metadata?.name
        );
        setUser(userData);
      } catch (error) {
        console.error(error);
        alert('정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (!user) return null; // Or redirect handled above

  // Aggregate incoming requests (only show pending ones)
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

      <div className="p-4 space-y-6">
        {/* Profile Section */}

        {/* Profile Section */}
        <section className="bg-white rounded-2xl p-6 shadow-sm relative">
          {/* Edit Button */}
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="absolute top-6 right-6 text-gray-400 hover:text-indigo-600 transition-colors"
              title="프로필 수정"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
            </button>
          )}

          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-2xl">
              {user.name?.[0] || 'U'}
            </div>

            {!isEditing ? (
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">
                  {user.name && user.name !== 'User' ? user.name : user.username}
                </h2>
                <p className="text-gray-500 text-sm">@{user.username}</p>
                <p className="text-gray-400 text-xs mt-1">{user.email}</p>
              </div>
            ) : (
              <div className="flex-1">
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm mb-2"
                  placeholder="이름"
                />
                <p className="text-gray-500 text-sm">@{user.username}</p>
              </div>
            )}
          </div>

          {/* Admin Action */}
          {user.role === 'admin' && (
            <Link href="/admin" className="block w-full py-3 mb-4 bg-indigo-600 text-white font-bold text-center rounded-xl shadow-md hover:bg-indigo-700 transition-colors">
              관리자 대시보드 접속
            </Link>
          )}

          {isEditing ? (
            <form onSubmit={handleUpdateProfile} className="space-y-4 mb-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">연락처</label>
                <input
                  type="text"
                  value={editForm.contact}
                  onChange={(e) => setEditForm({ ...editForm, contact: e.target.value })}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">직업</label>
                  <input
                    type="text"
                    value={editForm.job}
                    onChange={(e) => setEditForm({ ...editForm, job: e.target.value })}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">주소</label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              <div className="flex space-x-2 pt-2">
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-bold shadow-sm">저장</button>
                <button type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm font-bold">취소</button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-xl mb-4">
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
          )}

          <div className="border-t border-gray-100 pt-2">
            <LogoutButton />
          </div>
        </section>

        {/* Incoming Requests (For Organizers) */}
        {incomingRequests.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-2 px-1">
              <h2 className="text-lg font-bold text-indigo-900">신청 승인 대기 <span className="text-red-500 text-sm">({incomingRequests.length})</span></h2>
            </div>
            <div className="space-y-3">
              {incomingRequests.map((app: any) => (
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
              {user.applications.map((app: any) => (
                <div key={app.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-800">{app.posts?.title || '알 수 없는 게시글'}</h3>
                    <StatusBadge status={app.status} />
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">{new Date(app.created_at || app.createdAt).toLocaleDateString()} 신청</span>
                    {app.status === 'pending' && <CancelApplicationButton applicationId={app.id} />}
                    {app.status === 'approved' && (
                      <Link href={`/reviews/write/${app.post_id || app.postId}`} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded font-bold">후기작성</Link>
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
              {user.posts.map((post: any) => (
                <Link key={post.id} href={`/board/${post.id}`} className="min-w-[200px] bg-white p-4 rounded-xl shadow-sm border border-gray-100 block">
                  <h3 className="font-bold text-sm truncate mb-1">{post.title}</h3>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{post.currentParticipants}/{post.maxParticipants}명</span>
                    <span>{post.is_recruiting ? '모집중' : '마감'}</span>
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
              {user.postScraps.map((scrap: any) => (
                <Link key={scrap.id} href={`/board/${scrap.post_id || scrap.posts?.id}`} className="block p-4 hover:bg-gray-50">
                  <h3 className="font-bold text-gray-800">{scrap.posts?.title || '알 수 없는 게시글'}</h3>
                  <p className="text-xs text-gray-400 mt-1">{new Date(scrap.created_at || scrap.createdAt).toLocaleDateString()} 찜함</p>
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
              {user.reviews.map((review: any) => (
                <div key={review.id} className="p-4">
                  <h3 className="font-bold text-sm mb-1">{review.posts?.title || '삭제된 게시글'}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{review.content}</p>
                  <span className="text-xs text-gray-400 mt-2 block">{new Date(review.created_at || review.createdAt).toLocaleDateString()}</span>
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
