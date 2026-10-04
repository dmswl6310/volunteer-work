'use client';

import { useState } from 'react';
import { toggleScrap } from '@/actions/scrap';
import { useRouter } from 'next/navigation';
import { useToast } from './ToastProvider';
import { Heart } from 'lucide-react';
import { buildLoginHref, LOGIN_REQUIRED_CONFIRM_OPTIONS } from '@/lib/auth-navigation';

interface ScrapButtonProps {
  postId: string;
  initialIsScraped: boolean;
  initialScrapCount: number;
  canInteract: boolean;
}

/** 게시글 스크랩 토글 버튼 (낙관적 UI 업데이트 적용) */
export default function ScrapButton({ postId, initialIsScraped, initialScrapCount, canInteract }: ScrapButtonProps) {
  const [isScraped, setIsScraped] = useState(initialIsScraped);
  const [scrapCount, setScrapCount] = useState(initialScrapCount);
  const router = useRouter();
  const { showToast, showConfirm } = useToast();

  const handleToggle = async () => {
    if (!canInteract) {
      const shouldMoveToLogin = await showConfirm(
        '로그인하면 관심 활동을 저장할 수 있어요. 로그인 페이지로 이동할까요?',
        LOGIN_REQUIRED_CONFIRM_OPTIONS
      );
      if (shouldMoveToLogin) {
        router.push(buildLoginHref(`/board/${postId}`, `/board/${postId}`));
      }
      return;
    }

    // 낙관적 UI 업데이트
    const previousIsScraped = isScraped;
    const previousCount = scrapCount;

    setIsScraped(!isScraped);
    setScrapCount(isScraped ? scrapCount - 1 : scrapCount + 1);

    try {
      await toggleScrap(postId);
    } catch (error) {
      console.error('Failed to toggle scrap', error);
      // 에러 시 원래 상태로 복구
      setIsScraped(previousIsScraped);
      setScrapCount(previousCount);
      showToast('오류가 발생했습니다.', 'error');
    }
  };

  return (
    <button 
      onClick={handleToggle}
      className={`flex flex-col items-center rounded-2xl px-2 py-1.5 transition-colors ${isScraped ? 'text-rose-500 bg-rose-50' : 'text-slate-400 hover:bg-slate-100 hover:text-rose-400'}`}
    >
      <Heart 
        className="w-6 h-6" 
        fill={isScraped ? "currentColor" : "none"} 
      />
      <span className="text-[10px]">스크랩 {scrapCount}</span>
    </button>
  );
}
