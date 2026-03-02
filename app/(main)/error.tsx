'use client';

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
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">😥</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          문제가 발생했습니다
        </h2>
        <p className="text-gray-500 mb-6 text-sm">
          {error.message || '예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'}
        </p>
        <button
          onClick={reset}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}
