/**
 * 후기 게시판 로딩 스피너
 */
export default function ReviewsLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50/70">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-600"></div>
        <p className="text-sm text-slate-400">불러오는 중...</p>
      </div>
    </div>
  );
}
