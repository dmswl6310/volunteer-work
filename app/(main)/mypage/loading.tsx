'use client';

/**
 * 마이페이지 로딩 스켈레톤 UI
 */
export default function MyPageLoading() {
  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* 프로필 헤더 스켈레톤 */}
      <div className="bg-indigo-600 px-6 pt-8 pb-16">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-indigo-400 rounded-full animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-5 w-24 bg-indigo-400 rounded animate-pulse"></div>
            <div className="h-3 w-32 bg-indigo-400 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* 컨텐츠 스켈레톤 */}
      <div className="px-4 -mt-8 space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6">
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
