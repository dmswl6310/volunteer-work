'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * Pull to Refresh 컴포넌트
 * 모바일에서 아래로 당겨서 페이지를 새로고침합니다.
 */
export default function PullToRefresh({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const THRESHOLD = 80; // 새로고침 트리거 거리 (px)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // 스크롤이 맨 위에 있을 때만 Pull to Refresh 활성화
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
      setPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!pulling) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0 && diff < 150) {
      setPullDistance(diff);
    }
  }, [pulling]);

  const handleTouchEnd = useCallback(() => {
    if (pullDistance >= THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPullDistance(THRESHOLD);

      // 새로고침 실행
      router.refresh();
      setTimeout(() => {
        setRefreshing(false);
        setPullDistance(0);
        setPulling(false);
      }, 800);
    } else {
      setPullDistance(0);
      setPulling(false);
    }
  }, [pullDistance, refreshing, router]);

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull 인디케이터 */}
      <div
        className="flex justify-center items-center overflow-hidden transition-all duration-200"
        style={{ height: pullDistance > 0 ? `${Math.min(pullDistance, THRESHOLD)}px` : '0px' }}
      >
        <div className={`${refreshing ? 'animate-spin' : ''}`}>
          <Loader2
            className="w-6 h-6 text-indigo-500"
            style={{ transform: `rotate(${Math.min(pullDistance * 3, 360)}deg)` }}
          />
        </div>
      </div>

      {children}
    </div>
  );
}
