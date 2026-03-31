'use client';

/**
 * 게시판 로딩 스켈레톤 UI
 * 실제 데이터 로딩 중에 표시되는 뼈대 화면
 */
export default function BoardLoading() {
  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      {/* 헤더 스켈레톤 */}
      <div className="border-b border-slate-200/80 bg-white px-4 py-6">
        <div className="mb-2 h-3 w-24 animate-pulse rounded bg-slate-200"></div>
        <div className="mb-4 h-8 w-40 animate-pulse rounded-lg bg-slate-200"></div>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-8 w-16 animate-pulse rounded-full bg-slate-200"></div>
          ))}
        </div>
      </div>

      {/* 긴급 섹션 스켈레톤 */}
      <div className="px-4 py-4">
        <div className="mb-3 h-5 w-32 animate-pulse rounded bg-slate-200"></div>
        <div className="flex gap-3 overflow-hidden">
          {[1, 2].map(i => (
            <div key={i} className="min-w-[280px] rounded-3xl border border-slate-200 bg-white p-3 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
              <div className="flex gap-3">
                <div className="h-24 w-24 animate-pulse rounded-2xl bg-slate-200"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200"></div>
                  <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200"></div>
                  <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 게시글 목록 스켈레톤 */}
      <div className="mt-2 space-y-4 px-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
            <div className="h-24 w-24 flex-shrink-0 animate-pulse rounded-2xl bg-slate-200"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200"></div>
              <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200"></div>
              <div className="flex gap-2 mt-2">
                <div className="h-3 w-16 animate-pulse rounded bg-slate-200"></div>
                <div className="h-3 w-12 animate-pulse rounded bg-slate-200"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
