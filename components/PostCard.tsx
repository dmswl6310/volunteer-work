import type { PostWithAuthor } from '@/actions/posts';
import Link from 'next/link';

interface PostCardProps {
  post: PostWithAuthor;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <Link href={`/board/${post.id}`} className="block group">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
        <div className="relative aspect-[4/3] bg-gray-200">
          {post.imageUrl ? (
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          ) : (
             <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                <span className="text-xs">No Image</span>
             </div>
          )}
          {post.isUrgent && (
            <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
              긴급
            </span>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-1">
             <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
               {post.category || '기타'}
             </span>
             <span className="text-xs text-gray-400">
               조회 {post.views}
             </span>
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-indigo-600 transition-colors">
            {post.title}
          </h3>
          <p className="text-xs text-gray-500 mb-3">
             {post.author.name || '익명'}
          </p>
          
          <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
            <div className="flex items-center space-x-1">
               <span>모집</span>
               <span className="font-semibold text-gray-900">
                 {post.currentParticipants}/{post.maxParticipants}
               </span>
            </div>
             <div className="flex items-center space-x-1">
               {/* Icon for Scrap/Bookmark could go here */}
               <span>스크랩 {post.scraps}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
