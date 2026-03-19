'use client';

import { useState } from 'react';
import { toggleScrap } from '@/actions/scrap';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useToast } from './ToastProvider';
import { Heart } from 'lucide-react';

interface ScrapButtonProps {
  postId: string;
  initialIsScraped: boolean;
  initialScrapCount: number;
}

/** 게시글 스크랩 토글 버튼 (냙관적 UI 업데이트 적용) */
export default function ScrapButton({ postId, initialIsScraped, initialScrapCount }: ScrapButtonProps) {
  const [isScraped, setIsScraped] = useState(initialIsScraped);
  const [scrapCount, setScrapCount] = useState(initialScrapCount);
  const router = useRouter();
  const { showToast } = useToast();

  const handleToggle = async () => {
    // 냙관적 UI 업데이트
    const previousIsScraped = isScraped;
    const previousCount = scrapCount;

    setIsScraped(!isScraped);
    setScrapCount(isScraped ? scrapCount - 1 : scrapCount + 1);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
          router.push('/auth/login');
        } else {
            // Revert changes if user cancels login
            setIsScraped(previousIsScraped);
            setScrapCount(previousCount);
        }
        return;
      }

      await toggleScrap(postId, user.id);
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
      className={`flex flex-col items-center transition-colors ${isScraped ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
    >
      <Heart 
        className="w-6 h-6" 
        fill={isScraped ? "currentColor" : "none"} 
      />
      <span className="text-[10px]">스크랩 {scrapCount}</span>
    </button>
  );
}
