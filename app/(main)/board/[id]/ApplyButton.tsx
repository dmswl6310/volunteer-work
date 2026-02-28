'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { applyForPost } from '@/actions/apply';

interface ApplyButtonProps {
  postId: string;
  isRecruiting: boolean;
  isAuthor: boolean;
  hasApplied: boolean;
  isFull?: boolean;
}

export default function ApplyButton({ postId, isRecruiting, isAuthor, hasApplied, isFull }: ApplyButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(hasApplied);

  // 작성자에게는 수정하기 버튼 표시
  if (isAuthor) {
    return (
      <button
        onClick={() => router.push(`/board/${postId}/edit`)}
        className="w-full bg-gray-700 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-colors"
      >
        수정하기
      </button>
    );
  }

  // 이미 신청한 경우
  if (applied) {
    return (
      <button
        disabled
        className="w-full bg-green-100 text-green-700 font-bold py-3 rounded-xl cursor-not-allowed border border-green-200"
      >
        ✓ 신청 완료 (마이페이지에서 확인)
      </button>
    );
  }

  // 모집 마감/완료인 경우
  if (!isRecruiting) {
    return (
      <button disabled className={`w-full text-white font-bold py-3 rounded-xl cursor-not-allowed ${isFull ? 'bg-orange-500' : 'bg-gray-300'}`}>
        {isFull ? '모집 완료' : '모집 마감'}
      </button>
    );
  }

  const handleApply = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
          router.push('/auth/login');
        }
        return;
      }

      await applyForPost(postId, user.id, user.email || undefined);
      setApplied(true); // 성공 시 버튼 상태 변경
      alert('봉사활동 참여 신청이 완료되었습니다.\n관리자 승인 후 최종 확정됩니다.');
    } catch (error: any) {
      if (error.message?.includes('이미 신청')) {
        alert('이미 참여 신청한 봉사활동입니다.');
        setApplied(true); // 중복 신청이면 버튼도 막기
      } else {
        alert(error.message || '신청 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleApply}
      disabled={loading}
      className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-70"
    >
      {loading ? '처리 중...' : '참여하기'}
    </button>
  );
}
