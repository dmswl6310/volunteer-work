import type { PostWithAuthor } from '@/actions/posts';
import Link from 'next/link';

interface PostCardProps {
  post: PostWithAuthor;
}

export default function PostCard({ post }: PostCardProps) {
  // Safe default for dueDate
  const today = new Date();
  const dueDate = post.dueDate ? new Date(post.dueDate) : null;
  const isExpired = dueDate ? dueDate < today : false;
  
  return (
    <Link href={`/board/${post.id}`} className="block group">
      <div className="bg-white p-4 border-b border-gray-100 flex gap-4 hover:bg-gray-50 transition-colors">
        {/* Image - Left Side */}
        <div className="relative w-24 h-24 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden">
          {post.imageUrl ? (
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          ) : (
             <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                <span className="text-xs">No Img</span>
             </div>
          )}
          {post.isUrgent && (
            <span className="absolute top-0 left-0 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-br-lg">
              긴급
            </span>
          )}
        </div>

        {/* Content - Right Side */}
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
                 <span>{post.author.username || post.author.name || '익명'}</span>
              </div>
          </div>
          
          <div className="flex items-center justify-between mt-2">
               <div className="flex items-center space-x-2 text-xs">
                    <span className={`font-bold ${post.isRecruiting && !isExpired ? 'text-green-600' : 'text-gray-500'}`}>
                        {post.isRecruiting && !isExpired ? '모집중' : '마감'}
                    </span>
                    <span className="text-gray-400">
                        {post.currentParticipants}/{post.maxParticipants}명
                    </span>
               </div>
               
               {dueDate && (
                   <span className={`text-xs font-medium ${isExpired ? 'text-gray-400' : 'text-red-500'}`}>
                       {isExpired ? '마감됨' : `D-${Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))}`}
                   </span>
               )}
          </div>
        </div>
      </div>
    </Link>
  );
}
