import { getUrgentPosts } from '@/actions/posts';
import Link from 'next/link';

export default async function UrgentSection() {
  const urgentPosts = await getUrgentPosts();

  if (urgentPosts.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold text-gray-900 mb-4 px-1 flex items-center">
        <span className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse"></span>
        긴급 봉사활동
      </h2>
      <div className="flex overflow-x-auto space-x-4 pb-4 -mx-4 px-4 scrollbar-hide">
        {urgentPosts.map((post) => (
          <Link 
            key={post.id} 
            href={`/board/${post.id}`}
            className="flex-shrink-0 w-64 bg-white rounded-lg border border-red-100 shadow-sm p-3 relative hover:border-red-300 transition-colors"
          >
             {post.imageUrl && (
                <div className="h-32 w-full mb-3 rounded-md overflow-hidden">
                    <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                </div>
             )}
             <div className="mb-2">
                <span className="inline-block px-2 py-0.5 text-[10px] font-bold text-red-600 bg-red-50 rounded-full mb-2">
                    D-Day
                </span>
                <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{post.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{post.category || '봉사'}</p>
             </div>
             <div className="text-xs text-gray-400 mt-2 flex justify-between">
                <span>{post.author.name}</span>
                <span>{post.currentParticipants}/{post.maxParticipants}명</span>
             </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
