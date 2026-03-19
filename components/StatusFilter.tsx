'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

/** 모집 상태 필터 드롭다운 (모집중/마감/전체) */
export default function StatusFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get('status') || 'recruiting';

  const [activeStatus, setActiveStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setActiveStatus(currentStatus);
  }, [currentStatus]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value;
    // 1. UI 즉각 변경
    setActiveStatus(status);

    // 2. 실제 URL 및 서버 데이터 변경 요청
    const params = new URLSearchParams(searchParams.toString());
    params.set('status', status);
    
    startTransition(() => {
      router.push(`/board?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className="relative">
      <select
        value={activeStatus}
        onChange={handleChange}
        className="appearance-none pl-3 pr-8 py-1.5 rounded-full text-sm font-bold bg-white border border-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
      >
        <option value="recruiting">모집중</option>
        <option value="closed">마감</option>
        <option value="all">전체</option>
      </select>
      {/* 드롭다운 화살표 아이콘 */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
        <ChevronDown className="h-4 w-4" />
      </div>
    </div>
  );
}
