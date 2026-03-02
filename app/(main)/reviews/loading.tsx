/**
 * 후기 게시판 로딩 스피너
 */
export default function ReviewsLoading() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
        <p className="text-sm text-gray-400">불러오는 중...</p>
      </div>
    </div>
  );
}
