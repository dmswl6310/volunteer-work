'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastProvider';
import { applyForPost } from '@/actions/apply';

interface ApplyButtonProps {
  postId: string;
  isRecruiting: boolean;
  isAuthor: boolean;
  userApplicationStatus: string | null;
  isFull?: boolean;
}

export default function ApplyButton({ postId, isRecruiting, isAuthor, userApplicationStatus, isFull }: ApplyButtonProps) {
  const router = useRouter();
  const { showToast, showConfirm } = useToast();
  const [loading, setLoading] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(userApplicationStatus);

  // 작성자에게는 수정하기 버튼 표시
  if (isAuthor) {
    return (
        <button
          onClick={() => router.push(`/board/${postId}/edit`)}
          className="w-full rounded-2xl border border-slate-300 bg-white py-3 font-semibold text-slate-800 transition-colors hover:bg-slate-50"
        >
        수정하기
      </button>
    );
  }

  // 이미 신청한 경우 상태별 버튼 표시
  if (applicationStatus) {
    if (applicationStatus === 'pending') {
      return (
        <button
          disabled
          className="w-full cursor-not-allowed rounded-2xl border border-amber-200 bg-amber-50 py-3 font-semibold text-amber-700"
        >
          승인 대기 중
        </button>
      );
    }
    if (applicationStatus === 'approved') {
      return (
        <button
          disabled
          className="w-full cursor-not-allowed rounded-2xl border border-emerald-200 bg-emerald-50 py-3 font-semibold text-emerald-700"
        >
          ✓ 참여 확정
        </button>
      );
    }
    if (applicationStatus === 'rejected') {
      return (
        <button
          disabled
          className="w-full cursor-not-allowed rounded-2xl border border-rose-200 bg-rose-50 py-3 font-semibold text-rose-600"
        >
          ✕ 신청이 반려되었습니다
        </button>
      );
    }
    // 기타 상태 (cancelled 등)일 경우 다시 신청할 수 있게 하거나, 기본 신청완료 처리
    return (
        <button
          disabled
          className="w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-100 py-3 font-semibold text-slate-600"
        >
          참여 신청 내역 확인
        </button>
    );
  }

  // 모집 마감/완료인 경우
  if (!isRecruiting) {
    return (
      <button disabled className={`w-full cursor-not-allowed rounded-2xl py-3 font-semibold text-white ${isFull ? 'bg-slate-500' : 'bg-slate-300'}`}>
        {isFull ? '모집 완료' : '모집 마감'}
      </button>
    );
  }

  const handleApply = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        const shouldMoveToLogin = await showConfirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?', {
          title: '로그인 필요',
          confirmLabel: '로그인하러 가기',
        });
        if (shouldMoveToLogin) {
          router.push('/auth/login');
        }
        setLoading(false);
        return;
      }

      await applyForPost(postId);
      setApplicationStatus('pending'); // 성공 시 상태를 대기중으로 변경
      showToast('봉사활동 참여 신청이 완료되었습니다.\n관리자 승인 후 최종 확정됩니다.', 'success');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '신청 중 오류가 발생했습니다.';
      if (message.includes('이미 신청')) {
        showToast('이미 참여 신청한 봉사활동입니다.', 'warning');
        setApplicationStatus('pending'); // 중복 신청이면 버튼도 막기
      } else {
        showToast(message, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleApply}
      disabled={loading}
      className="w-full rounded-2xl bg-amber-600 py-3 font-semibold text-white transition-colors shadow-[0_14px_30px_rgba(217,119,6,0.22)] hover:bg-amber-700 disabled:opacity-70"
    >
      {loading ? '처리 중...' : '참여하기'}
    </button>
  );
}
