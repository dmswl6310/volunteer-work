'use client';

import Link from 'next/link';
import { rejectRemainingApplications, updateApplicationStatus } from '@/actions/apply';
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
  const [bulkRejectLoading, setBulkRejectLoading] = useState(false);
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

  const handleBulkReject = async () => {
    const confirmed = await showConfirm('이 게시글의 남은 승인 대기 신청을 모두 거절하시겠습니까?', {
      title: '남은 신청 일괄 거절',
      confirmLabel: '일괄 거절',
    });
    if (!confirmed) return;

    setBulkRejectLoading(true);
    try {
      const result = await rejectRemainingApplications(application.post.id);
      if (result.rejectedCount === 0) {
        showToast('이미 처리할 승인 대기 신청이 없습니다.', 'warning');
      } else {
        showToast(`남은 신청 ${result.rejectedCount}건을 일괄 거절했습니다.`, 'success');
      }
      window.location.reload();
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : '일괄 거절 처리 중 오류가 발생했습니다.', 'error');
      setBulkRejectLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-base font-semibold text-slate-900">{application.users?.username || '이름 없음'}</p>
          <div className="mb-3 space-y-1 rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-600">
            {application.users?.contact && <p>📞 연락처: {application.users.contact}</p>}
            {application.users?.email && <p>📧 이메일: {application.users.email}</p>}
            {application.users?.job && <p>💼 직업/소속기관: {application.users.job}</p>}
            {application.users?.address && <p>🏠 거주지: {application.users.address}</p>}
          </div>
          <p className="text-xs text-slate-400">신청일: {new Date(application.created_at).toLocaleString()}</p>
          <p className="mt-1 text-xs text-slate-400">
            지원 공고:{' '}
            <Link href={`/board/${application.post.id}`} className="font-medium text-slate-600 underline underline-offset-2 transition-colors hover:text-slate-800">
              {application.post.title}
            </Link>
          </p>
          {isFull && <p className="mt-1 text-xs font-medium text-amber-600">모집 인원이 모두 차서 승인할 수 없습니다.</p>}
          {isFull && (
            <button
              type="button"
              onClick={handleBulkReject}
              disabled={bulkRejectLoading || loading}
              className="mt-2 text-xs font-semibold text-rose-600 underline underline-offset-2 transition-colors hover:text-rose-700 disabled:opacity-50"
            >
              {bulkRejectLoading ? '처리 중...' : '남은 신청 일괄 거절'}
            </button>
          )}
        </div>

        <div className="flex w-[104px] shrink-0 flex-col space-y-2">
          <button
            onClick={() => handleStatus('approved')}
            disabled={loading || isFull}
            className="rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            {isFull ? '모집 완료' : '승인하기'}
          </button>
          <button
            onClick={() => handleStatus('rejected')}
            disabled={loading}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            거절하기
          </button>
        </div>
      </div>
    </div>
  );
}
