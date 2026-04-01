'use client';

import { useEffect } from 'react';
import Link from 'next/link'; // 홈으로 가기용 링크

/**
 * 메인 레이아웃 에러 바운더리
 * 예상치 못한 에러 발생 시 친절한 에러 화면을 보여줍니다.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // 개발자 추적용: 유저 화면에는 안 보이고 Vercel 콘솔 로그에만 에러 내역을 남깁니다.
  useEffect(() => {
    console.error('페이지 렌더링 에러:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">😥</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          문제가 발생했습니다
        </h2>

        {/* 유저에게는 DB 에러코드 대신, 항상 부드럽고 일관된 안내 문구만 보여줍니다. */}
        <p className="text-gray-500 mb-8 text-sm leading-relaxed">
          예상치 못한 오류가 발생하여 페이지를 불러오지 못했습니다. <br />
          잠시 후 다시 시도해 주세요.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="w-full bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
          >
            다시 시도
          </button>

          {/* 무한 에러 루프에 빠진 유저를 구출해 줄 탈출구 */}
          <Link
            href="/"
            className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-300 transition-colors block"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}