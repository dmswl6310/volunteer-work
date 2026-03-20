'use client';

import { useState } from 'react';
import { toggleReviewLike } from '@/actions/review';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useToast } from './ToastProvider';
import { ThumbsUp } from 'lucide-react';

interface ReviewLikeButtonProps {
  reviewId: string;
  initialIsLiked: boolean;
  initialLikeCount: number;
}

/** 후기 좋아요 토글 버튼 (낙관적 UI 업데이트 적용) */
export default function ReviewLikeButton({ reviewId, initialIsLiked, initialLikeCount }: ReviewLikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  const handleToggle = async () => {
    if (isLoading) return;

    // 낙관적 UI 업데이트
    const previousIsLiked = isLiked;
    const previousCount = likeCount;

    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLiked(previousIsLiked);
        setLikeCount(previousCount);
        if (confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
          router.push('/auth/login');
        }
        return;
      }

      await toggleReviewLike(reviewId, user.id);
      router.refresh();
    } catch (error) {
      console.error('Failed to toggle review like', error);
      setIsLiked(previousIsLiked);
      setLikeCount(previousCount);
      showToast('오류가 발생했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`flex items-center space-x-1 text-sm transition-colors ${
        isLiked
          ? 'text-indigo-600'
          : 'text-gray-400 hover:text-indigo-500'
      } ${isLoading ? 'opacity-50' : ''}`}
    >
      <ThumbsUp
        className="w-4 h-4"
        fill={isLiked ? 'currentColor' : 'none'}
      />
      <span className="text-xs">{likeCount}</span>
    </button>
  );
}
