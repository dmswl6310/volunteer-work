'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SortFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get('sort') || 'latest';
  
  const [activeSort, setActiveSort] = useState(currentSort);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setActiveSort(currentSort);
  }, [currentSort]);

  const handleClick = (sort: 'latest' | 'deadline') => {
    setActiveSort(sort);
    
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', sort);
    
    startTransition(() => {
      router.push(`/board?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className="flex space-x-3 items-center">
      <button
        onClick={() => handleClick('latest')}
        className={`touch-feedback text-sm font-medium transition-colors ${activeSort === 'latest' ? 'text-gray-900' : 'text-gray-400 hover:text-teal-600'}`}
      >
        최신순
      </button>
      <span className="text-gray-200">|</span>
      <button
        onClick={() => handleClick('deadline')}
        className={`touch-feedback text-sm font-medium transition-colors ${activeSort === 'deadline' ? 'text-gray-900' : 'text-gray-400 hover:text-teal-600'}`}
      >
        마감임박순
      </button>
    </div>
  );
}
