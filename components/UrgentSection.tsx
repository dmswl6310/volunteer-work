import { getUrgentPosts } from '@/actions/posts';
import Link from 'next/link';
import Image from 'next/image';
import { getPostStatus, getUrgentStatusLabel } from '@/lib/post-status';
import FallbackImage from '@/components/FallbackImage';

/** 긴급 봉사활동 가로 스크롤 섹션 (서버 컴포넌트) */
export default async function UrgentSection({ status = 'recruiting' }: { status?: 'recruiting' | 'closed' | 'all' }) {
  const urgentPosts = await getUrgentPosts(status);

  if (urgentPosts.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="flex items-center text-lg font-semibold text-slate-900">
          <span className="mr-2 h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
          긴급 봉사활동
        </h2>
        {/* 스크롤 힌트 */}
        <span className="text-xs text-slate-400">옆으로 넘겨보세요 &rarr;</span>
      </div>

      <div className="flex overflow-x-auto space-x-4 pb-4 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
        {urgentPosts.map((post) => {
          const status = getPostStatus({
            dueDate: post.due_date,
            isRecruiting: post.is_recruiting,
            currentParticipants: post.current_participants,
            maxParticipants: post.max_participants,
          });
          const dDayText = getUrgentStatusLabel(status);

          return (
            <Link
              key={post.id}
              href={`/board/${post.id}`}
              className="relative w-[85vw] flex-shrink-0 snap-center rounded-3xl border border-slate-200/80 bg-white shadow-[0_10px_26px_rgba(15,23,42,0.04)] transition-colors hover:border-slate-300 sm:w-72"
            >
              <div className="flex p-3 gap-3">
                {/* Image */}
                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-200">
                  {post.image_url ? (
                      <Image 
                        src={post.image_url} 
                        alt={post.title} 
                        fill 
                        className="object-cover" 
                        sizes="96px"
                        priority={post.id === urgentPosts[0]?.id}
                      />
                  ) : (
                      <FallbackImage category={post.category ?? undefined} className="rounded-2xl" iconSize={24} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`inline-block rounded-full px-2 py-1 text-[10px] font-semibold ${status.isFull && !status.isExpired ? 'border border-slate-200 bg-slate-100 text-slate-600' : 'border border-rose-200 bg-rose-50 text-rose-700'}`}>
                        {dDayText}
                      </span>
                    </div>
                    <h3 className="mb-1 line-clamp-2 text-sm font-semibold leading-tight text-slate-900">{post.title}</h3>
                    <p className="text-xs text-slate-500">{post.category || '기타'}</p>
                  </div>

                  <div className="flex justify-between items-end text-xs mt-2">
                    <span className="font-medium text-slate-600">{post.author.username || '익명'}</span>
                    <span className="text-slate-400">{post.current_participants}/{post.max_participants}명</span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
