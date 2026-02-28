import { getUrgentPosts } from '@/actions/posts';
import Link from 'next/link';

export default async function UrgentSection() {
  const urgentPosts = await getUrgentPosts();

  if (urgentPosts.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-lg font-bold text-gray-900 flex items-center">
          <span className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse"></span>
          긴급 봉사활동
        </h2>
        {/* Scroll Hint */}
        <span className="text-xs text-gray-400">옆으로 넘겨보세요 &rarr;</span>
      </div>

      <div className="flex overflow-x-auto space-x-4 pb-4 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
        {urgentPosts.map((post) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const dueDate = post.dueDate ? new Date(post.dueDate) : null;
          if (dueDate) dueDate.setHours(0, 0, 0, 0);
          const diffDays = dueDate ? Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 0;
          const isFull = post.currentParticipants >= post.maxParticipants;
          let dDayText = diffDays > 0 ? `D-${diffDays}` : (diffDays === 0 ? 'D-Day' : '마감');
          if (diffDays >= 0 && isFull) dDayText = '모집 마감';

          return (
            <Link
              key={post.id}
              href={`/board/${post.id}`}
              className="flex-shrink-0 w-[85vw] sm:w-72 bg-white rounded-xl border border-red-100 shadow-sm relative hover:border-red-300 transition-colors snap-center"
            >
              <div className="flex p-3 gap-3">
                {/* Image */}
                <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  {post.imageUrl ? (
                    <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                      <span className="text-[10px]">No Img</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`inline-block px-1.5 py-0.5 text-[10px] font-bold rounded ${isFull ? 'text-orange-600 bg-orange-50' : 'text-red-600 bg-red-50'}`}>
                        {dDayText}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-tight mb-1">{post.title}</h3>
                    <p className="text-xs text-gray-500">{post.category || '기타'}</p>
                  </div>

                  <div className="flex justify-between items-end text-xs mt-2">
                    <span className="text-gray-600 font-medium">{post.author.username || post.author.name || '익명'}</span>
                    <span className="text-gray-400">{post.currentParticipants}/{post.maxParticipants}명</span>
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
