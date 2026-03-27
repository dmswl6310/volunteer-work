'use client';

import Link from 'next/link';
import { updateApplicationStatus } from '@/actions/apply';
import { useState } from 'react';
import { useToast } from './ToastProvider';

type RequestUser = {
  username: string | null;
  contact: string | null;
  email: string | null;
  job: string | null;
  address: string | null;
};

type RequestPost = {
  id: string;
  title: string;
  current_participants?: number | null;
  max_participants?: number | null;
};

export type IncomingRequestApplication = {
  id: string;
  created_at: string;
  users: RequestUser | null;
  post: RequestPost;
};

/** 들어오는 신청 항목 컴포넌트 (승인/거절 버튼 포함) */
export default function IncomingRequestItem({ application }: { application: IncomingRequestApplication }) {
  const [loading, setLoading] = useState(false);
  const { showToast, showConfirm } = useToast();
  const isFull =
    typeof application.post.current_participants === 'number' &&
    typeof application.post.max_participants === 'number' &&
    application.post.current_participants >= application.post.max_participants;

  const handleStatus = async (status: 'approved' | 'rejected') => {
    if (status === 'approved' && isFull) {
      showToast('모집 인원이 모두 차서 더 이상 승인할 수 없습니다.', 'warning');
      return;
    }

    const confirmed = await showConfirm(`${status === 'approved' ? '승인' : '거절'}하시겠습니까?`, {
      title: `신청 ${status === 'approved' ? '승인' : '거절'}`,
      confirmLabel: status === 'approved' ? '승인하기' : '거절하기',
    });
    if (!confirmed) return;
    setLoading(true);
    try {
      await updateApplicationStatus(application.id, status);
      showToast(`${status === 'approved' ? '승인' : '거절'}되었습니다.`, 'success');
      window.location.reload();
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : '상태 변경 중 오류가 발생했습니다.', 'error');
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg shadow-sm">
      <div>
        <p className="font-bold text-gray-900 text-base mb-1">
          {application.users?.username || '이름 없음'}
        </p>
        <div className="text-sm text-gray-600 mb-2 space-y-0.5">
          {application.users?.contact && <p>📞 연락처: {application.users.contact}</p>}
          {application.users?.email && <p>📧 이메일: {application.users.email}</p>}
          {application.users?.job && <p>💼 직업/소속기관: {application.users.job}</p>}
          {application.users?.address && <p>🏠 거주지: {application.users.address}</p>}
        </div>
        <p className="text-xs text-gray-400">
          신청일: {new Date(application.created_at).toLocaleString()}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          지원 공고:{' '}
          <Link href={`/board/${application.post.id}`} className="font-medium text-gray-600 underline underline-offset-2 hover:text-indigo-600">
            {application.post.title}
          </Link>
        </p>
        {isFull && <p className="mt-1 text-xs font-medium text-orange-600">모집 인원이 모두 차서 승인할 수 없습니다.</p>}
      </div>
      <div className="flex flex-col space-y-2 ml-4">
        <button
          onClick={() => handleStatus('approved')}
          disabled={loading || isFull}
          className="px-4 py-2 bg-green-100 text-green-700 text-sm font-bold rounded-lg hover:bg-green-200 transition-colors disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
        >
          {isFull ? '모집 완료' : '승인하기'}
        </button>
        <button
          onClick={() => handleStatus('rejected')}
          disabled={loading}
          className="px-4 py-2 bg-red-100 text-red-700 text-sm font-bold rounded-lg hover:bg-red-200 transition-colors"
        >
          거절하기
        </button>
      </div>
    </div>
  );
}
