'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ClipboardList, PenLine, Settings, Bell, ClipboardCheck, CheckCircle2 } from 'lucide-react';
import IncomingRequestItem from '@/components/IncomingRequestItem';
import CancelApplicationButton from '@/components/CancelApplicationButton';
import ProfileEditForm from '@/components/ProfileEditForm';
import LogoutButton from '@/components/LogoutButton';
import StatusBadge from '@/components/StatusBadge';

type Tab = 'requests' | 'activity' | 'settings';

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  {
    key: 'requests',
    label: '신청/요청',
    icon: <ClipboardList className="w-4 h-4" />,
  },
  {
    key: 'activity',
    label: '활동기록',
    icon: <PenLine className="w-4 h-4" />,
  },
  {
    key: 'settings',
    label: '설정',
    icon: <Settings className="w-4 h-4" />,
  },
];

interface MyPageTabsProps {
  user: any;
  incomingRequests: any[];
}

export default function MyPageTabs({ user, incomingRequests }: MyPageTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('requests');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 완료된 활동: 승인됨 + 마감일 지남
  const completedActivities = user.applications.filter((app: any) => {
    if (app.status !== 'approved') return false;
    const dueDate = app.posts?.due_date ? new Date(app.posts.due_date) : null;
    if (!dueDate) return false;
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  });

  // 진행중 신청: 완료된 활동 제외
  const completedIds = new Set(completedActivities.map((a: any) => a.id));
  const activeApplications = user.applications.filter((app: any) => !completedIds.has(app.id));
  const pendingApplications = activeApplications.filter((app: any) => app.status === 'pending');

  return (
    <>
      {/* 요약 카드 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={() => setActiveTab('requests')}
          className={`bg-white rounded-xl p-4 shadow-sm border text-left transition-all ${
            activeTab === 'requests' ? 'border-indigo-200 ring-1 ring-indigo-100' : 'border-gray-100 hover:border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">승인 대기</span>
            <span className="w-6 h-6 bg-red-50 rounded-full flex items-center justify-center">
              <Bell className="w-3.5 h-3.5 text-red-500" />
            </span>
          </div>
          <span className={`text-2xl font-extrabold ${incomingRequests.length > 0 ? 'text-red-600' : 'text-gray-300'}`}>
            {incomingRequests.length}
          </span>
          <span className="text-xs text-gray-400 ml-1">건</span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`bg-white rounded-xl p-4 shadow-sm border text-left transition-all ${
            activeTab === 'requests' ? 'border-indigo-200 ring-1 ring-indigo-100' : 'border-gray-100 hover:border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">내 신청</span>
            <span className="w-6 h-6 bg-indigo-50 rounded-full flex items-center justify-center">
              <ClipboardCheck className="w-3.5 h-3.5 text-indigo-500" />
            </span>
          </div>
          <span className={`text-2xl font-extrabold ${pendingApplications.length > 0 ? 'text-indigo-600' : 'text-gray-300'}`}>
            {pendingApplications.length}
          </span>
          <span className="text-xs text-gray-400 ml-1">건 대기중</span>
        </button>
      </div>

      {/* 탭 바 */}
      <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 p-1 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div className="space-y-4">
        {/* ========== 신청/요청 탭 ========== */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            {/* 신청 승인 대기 (들어온 요청) */}
            {incomingRequests.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-2 px-1">
                  <h2 className="text-base font-bold text-gray-900">
                    신청 승인 대기 <span className="text-red-500 text-sm">({incomingRequests.length})</span>
                  </h2>
                </div>
                <div className="space-y-3">
                  {incomingRequests.map((app: any) => (
                    <IncomingRequestItem key={app.id} application={app} />
                  ))}
                </div>
              </section>
            )}

            {/* 참여 신청 내역 (진행중만) */}
            <section>
              <h2 className="text-base font-bold text-gray-900 mb-3 px-1">참여 신청 내역</h2>
              {activeApplications.length === 0 ? (
                <div className="bg-white rounded-xl p-6 text-center text-gray-400 text-sm shadow-sm">진행중인 신청이 없습니다.</div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
                  {activeApplications.map((app: any) => (
                    <div key={app.id} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <Link href={`/board/${app.post_id || app.postId}`} className="font-bold text-gray-800 hover:text-indigo-600 transition-colors">
                          {app.posts?.title || '알 수 없는 게시글'}
                        </Link>
                        <StatusBadge status={app.status} />
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">{new Date(app.created_at || app.createdAt).toLocaleDateString()} 신청</span>
                        {app.status === 'pending' && <CancelApplicationButton applicationId={app.id} />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* ========== 활동기록 탭 ========== */}
        {activeTab === 'activity' && (
          <div className="space-y-6">
            {/* 완료된 활동 */}
            <section>
              <h2 className="text-base font-bold text-gray-900 mb-3 px-1">완료된 활동</h2>
              {completedActivities.length === 0 ? (
                <div className="bg-white rounded-xl p-6 text-center text-gray-400 text-sm shadow-sm">완료된 활동이 없습니다.</div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
                  {completedActivities.map((app: any) => (
                    <div key={app.id} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                          <Link href={`/board/${app.post_id || app.postId}`} className="font-bold text-gray-800 hover:text-indigo-600 transition-colors">
                            {app.posts?.title || '알 수 없는 게시글'}
                          </Link>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">
                          마감일: {new Date(app.posts?.due_date).toLocaleDateString()}
                        </span>
                        <Link href={`/reviews/write/${app.post_id || app.postId}`} className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-100 transition-colors">
                          후기 작성
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 내가 올린 글 */}
            <section>
              <h2 className="text-base font-bold text-gray-900 mb-3 px-1">내가 올린 글</h2>
              {user.posts.length === 0 ? (
                <div className="bg-white rounded-xl p-6 text-center text-gray-400 text-sm shadow-sm">작성한 게시글이 없습니다.</div>
              ) : (
                <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                  {user.posts.map((post: any) => (
                    <Link key={post.id} href={`/board/${post.id}`} className="min-w-[200px] bg-white p-4 rounded-xl shadow-sm border border-gray-100 block">
                      <h3 className="font-bold text-sm truncate mb-1">{post.title}</h3>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{post.current_participants}/{post.max_participants}명</span>
                        <span>{post.is_recruiting ? '모집중' : '마감'}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* 관심 봉사활동 */}
            <section>
              <h2 className="text-base font-bold text-gray-900 mb-3 px-1">관심 봉사활동</h2>
              {user.postScraps.length === 0 ? (
                <div className="bg-white rounded-xl p-6 text-center text-gray-400 text-sm shadow-sm">찜한 활동이 없습니다.</div>
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

            {/* 내가 쓴 후기 */}
            <section>
              <h2 className="text-base font-bold text-gray-900 mb-3 px-1">내가 쓴 후기</h2>
              {user.reviews.length === 0 ? (
                <div className="bg-white rounded-xl p-6 text-center text-gray-400 text-sm shadow-sm">작성한 후기가 없습니다.</div>
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
        )}

        {/* ========== 설정 탭 ========== */}
        {activeTab === 'settings' && (
          <section className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-4">프로필 수정</h2>
            <ProfileEditForm user={user} />
            <div className="border-t border-gray-100 pt-4 mt-4">
              <LogoutButton />
            </div>
          </section>
        )}
      </div>
    </>
  );
}
