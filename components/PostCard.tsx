import type { PostWithAuthor } from '@/actions/posts';
import Link from 'next/link';
import Image from 'next/image';
import FallbackImage from '@/components/FallbackImage';
import { getPostStatus } from '@/lib/post-status';

interface PostCardProps {
  post: PostWithAuthor;
  priorityImage?: boolean;
}

/** 봉사활동 게시글 카드 컴포넌트 (목록 페이지에서 사용) */
export default function PostCard({ post, priorityImage = false }: PostCardProps) {
  const { dueDate, isClosed, isFull, isOpenRecruiting, diffDays } = getPostStatus({
    dueDate: post.due_date,
    isRecruiting: post.is_recruiting,
    currentParticipants: post.current_participants,
    maxParticipants: post.max_participants,
  });

  return (
    <Link href={`/board/${post.id}`} className="block group touch-feedback">
      <div className={`flex gap-4 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.04)] transition-colors ${isClosed ? 'opacity-55 grayscale' : 'hover:border-slate-300 hover:bg-slate-50/40'
        }`}>
        {/* 이미지 - 왼쪽 */}
          <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-200">
          {post.image_url ? (
            <Image
              src={post.image_url}
              alt={post.title}
              fill
              className="object-cover"
              sizes="96px"
              priority={priorityImage}
            />
          ) : (
            <FallbackImage category={post.category ?? undefined} className="rounded-lg" iconSize={24} />
          )}
          {post.is_urgent && !isClosed && (
              <span className="absolute left-0 top-0 rounded-br-xl bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
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
        <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
          <div>
            <div className="mb-1 flex justify-between items-start">
              <h3 className="whitespace-normal break-words text-base font-semibold leading-tight text-slate-900 transition-colors group-hover:text-amber-700 [word-break:keep-all]">
                {post.title}
              </h3>
            </div>
            <div className="mb-1 flex items-center space-x-2 text-xs text-slate-500">
              <span className="font-medium text-slate-700">{post.category || '기타'}</span>
              <span>·</span>
              <span>{post.author?.username || '익명'}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-2 text-xs">
              {isOpenRecruiting && (
                <span className="font-semibold text-amber-600">모집중</span>
              )}
              {!isClosed && isFull && (
                <span className="font-semibold text-slate-500">모집 완료</span>
              )}
              <span className="text-slate-400">
                {post.current_participants}/{post.max_participants}명
              </span>
            </div>

            {/* D-day: 마감되지 않은 게시글만 표시 */}
             {!isClosed && dueDate && diffDays !== null && (
              <span className="text-xs font-medium text-rose-500">
                D-{diffDays}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
