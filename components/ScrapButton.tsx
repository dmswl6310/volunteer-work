'use client';

import { useState } from 'react';
import { toggleScrap } from '@/actions/scrap';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface ScrapButtonProps {
  postId: string;
  initialIsScraped: boolean;
  initialScrapCount: number;
}

export default function ScrapButton({ postId, initialIsScraped, initialScrapCount }: ScrapButtonProps) {
  const [isScraped, setIsScraped] = useState(initialIsScraped);
  const [scrapCount, setScrapCount] = useState(initialScrapCount);
  const router = useRouter();

  const handleToggle = async () => {
    // Optimistic update
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
      // Revert on error
      setIsScraped(previousIsScraped);
      setScrapCount(previousCount);
      alert('오류가 발생했습니다.');
    }
  };

  return (
    <button 
      onClick={handleToggle}
      className={`flex flex-col items-center transition-colors ${isScraped ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
    >
      <svg 
        className="w-6 h-6" 
        fill={isScraped ? "currentColor" : "none"} 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      <span className="text-[10px]">스크랩 {scrapCount}</span>
    </button>
  );
}
