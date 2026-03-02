import type { PostWithAuthor } from '@/actions/posts';
import Link from 'next/link';

interface PostCardProps {
  post: PostWithAuthor;
}

/** 봉사활동 게시글 카드 컴포넌트 (목록 페이지에서 사용) */
export default function PostCard({ post }: PostCardProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = post.due_date ? new Date(post.due_date) : null;
  if (dueDate) dueDate.setHours(0, 0, 0, 0);
  const isExpired = dueDate ? dueDate < today : false;
  const isFull = post.current_participants >= post.max_participants;
  const isClosed = !post.is_recruiting || isExpired;

  return (
    <Link href={`/board/${post.id}`} className="block group">
      <div className={`bg-white p-4 border-b border-gray-100 flex gap-4 transition-colors ${isClosed ? 'opacity-50 grayscale' : 'hover:bg-gray-50'
        }`}>
        {/* 이미지 - 왼쪽 */}
        <div className="relative w-24 h-24 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden">
          {post.image_url ? (
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
              <span className="text-xs">No Img</span>
            </div>
          )}
          {post.is_urgent && !isClosed && (
            <span className="absolute top-0 left-0 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-br-lg">
              긴급
            </span>
          )}
          {isClosed && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <span className="text-white text-[11px] font-bold">마감</span>
            </div>
          )}
        </div>

        {/* 컨텐츠 - 오른쪽 */}
        <div className="flex-1 flex flex-col justify-between py-0.5">
          <div>
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-base font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
                {post.title}
              </h3>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500 mb-1">
              <span className="font-medium text-gray-700">{post.category || '기타'}</span>
              <span>·</span>
              <span>{post.author?.username || post.author?.name || '익명'}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-2 text-xs">
              {!isClosed && !isFull && (
                <span className="font-bold text-green-600">모집중</span>
              )}
              {!isClosed && isFull && (
                <span className="font-bold text-orange-500">모집 완료</span>
              )}
              <span className="text-gray-400">
                {post.current_participants}/{post.max_participants}명
              </span>
            </div>

            {/* D-day: 마감되지 않은 게시글만 표시 */}
            {!isClosed && dueDate && (
              <span className="text-xs font-medium text-red-500">
                D-{Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
