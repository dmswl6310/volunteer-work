'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { applyForPost } from '@/actions/apply';

interface ApplyButtonProps {
  postId: string;
  isRecruiting: boolean;
}

export default function ApplyButton({ postId, isRecruiting }: ApplyButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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
      alert('신청이 완료되었습니다! (승인 대기)');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isRecruiting) {
    return (
      <button disabled className="w-full bg-gray-300 text-white font-bold py-3 rounded-xl cursor-not-allowed">
        모집 마감
      </button>
    );
  }

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
