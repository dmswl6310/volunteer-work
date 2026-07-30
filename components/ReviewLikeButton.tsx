'use client';

import { useState } from 'react';
import { toggleReviewLike } from '@/actions/review';
import { useRouter } from 'next/navigation';
import { useToast } from './ToastProvider';
import { ThumbsUp } from 'lucide-react';
import { buildLoginHref } from '@/lib/auth-navigation';

interface ReviewLikeButtonProps {
  reviewId: string;
  initialIsLiked: boolean;
  initialLikeCount: number;
  canInteract: boolean;
  returnTo: string;
}

/** 후기 좋아요 토글 버튼 (낙관적 UI 업데이트 적용) */
export default function ReviewLikeButton({ reviewId, initialIsLiked, initialLikeCount, canInteract, returnTo }: ReviewLikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { showToast, showConfirm } = useToast();

  const handleToggle = async () => {
    if (isLoading) return;

    if (!canInteract) {
      const shouldMoveToLogin = await showConfirm('후기에 공감하려면 로그인이 필요해요. 로그인 페이지로 이동할까요?', {
        title: '로그인 필요',
        confirmLabel: '로그인하기',
      });
      if (shouldMoveToLogin) {
        router.push(buildLoginHref(returnTo));
      }
      return;
    }

    // 낙관적 UI 업데이트
    const previousIsLiked = isLiked;
    const previousCount = likeCount;

    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    setIsLoading(true);

    try {
      await toggleReviewLike(reviewId);
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
      className={`flex items-center space-x-1 rounded-full px-2 py-1 text-sm transition-colors ${
        isLiked
          ? 'bg-amber-50 text-amber-600'
          : 'text-slate-400 hover:bg-slate-100 hover:text-amber-500'
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
