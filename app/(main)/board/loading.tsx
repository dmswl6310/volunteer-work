'use client';

/**
 * 게시판 로딩 스켈레톤 UI
 * 실제 데이터 로딩 중에 표시되는 뼈대 화면
 */
export default function BoardLoading() {
  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* 헤더 스켈레톤 */}
      <div className="bg-white px-4 py-6">
        <div className="h-8 w-40 bg-gray-200 rounded-lg animate-pulse mb-4"></div>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-8 w-16 bg-gray-200 rounded-full animate-pulse"></div>
          ))}
        </div>
      </div>

      {/* 긴급 섹션 스켈레톤 */}
      <div className="px-4 py-4">
        <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-3"></div>
        <div className="flex gap-3 overflow-hidden">
          {[1, 2].map(i => (
            <div key={i} className="min-w-[280px] bg-white rounded-xl shadow-sm p-3">
              <div className="flex gap-3">
                <div className="w-24 h-24 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 게시글 목록 스켈레톤 */}
      <div className="bg-white mt-2">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="p-4 border-b border-gray-100 flex gap-4">
            <div className="w-24 h-24 bg-gray-200 rounded-lg animate-pulse flex-shrink-0"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
              <div className="flex gap-2 mt-2">
                <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-12"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
