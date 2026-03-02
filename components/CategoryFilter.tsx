'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CATEGORIES } from '@/lib/constants';

const FILTER_CATEGORIES = [
  { id: 'all', name: '전체' },
  ...CATEGORIES.map(cat => ({ id: cat, name: cat })),
];

/**
 * 카테고리 필터 컴포넌트 (Optimistic UI 적용)
 * 클릭 시 즉각적으로 상태가 변환되어 사용자 피로도를 줄입니다.
 */
export default function CategoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category') || 'all';
  
  // 사용자가 클릭한 상태를 즉각 반영하기 위한 로컬 상태
  const [activeId, setActiveId] = useState(currentCategory);
  const [isPending, startTransition] = useTransition();

  // URL이 외부에서 변경된 경우 (예: 뒤로가기) 동기화
  useEffect(() => {
    setActiveId(currentCategory);
  }, [currentCategory]);

  const handleClick = (catId: string) => {
    // 1. 클릭 즉시 로컬 상태(UI) 변경 -> 반응성 극대화
    setActiveId(catId);
    
    // 2. 백그라운드에서 서버로 요청 (router.push)
    const params = new URLSearchParams(searchParams.toString());
    params.set('category', catId);
    
    startTransition(() => {
      // scroll: false로 화면 튕김 현상 방지
      router.push(`/board?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide">
      {FILTER_CATEGORIES.map((cat) => {
        const isActive = activeId === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => handleClick(cat.id)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium transition-colors touch-feedback ${
              isActive
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
