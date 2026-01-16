import { getPost } from '@/actions/get-post';
import { notFound } from 'next/navigation';
import ApplyButton from './ApplyButton'; // Client Component for interaction
import ReviewList from '@/components/ReviewList';

import ScrapButton from '@/components/ScrapButton';
import { supabase } from '@/lib/supabase';
import prisma from '@/lib/prisma';

export default async function PostDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const post = await getPost(params.id);

  if (!post) {
    notFound();
  }

  // Check if current user has scrapped this post
  const { data: { user } } = await supabase.auth.getUser();
  let isScraped = false;

  if (user) {
    const scrap = await prisma.postScrap.findUnique({
      where: {
        postId_userId: {
          postId: post.id,
          userId: user.id,
        },
      },
    });
    isScraped = !!scrap;
  }

  return (
    <div className="pb-24 bg-white min-h-screen">
      {/* Image Header */}
      <div className="relative w-full aspect-video bg-gray-200">
        {post.imageUrl ? (
          <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
        <div className="absolute top-4 left-4">
             <button className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-sm hover:bg-white transition">
               <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
               </svg>
             </button>
        </div>
      </div>

      <div className="px-5 py-6">
        {/* Title & Category */}
        <div className="mb-6">
           <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full mb-2">
             {post.category}
           </span>
           <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-2">
             {post.title}
           </h1>
           <p className="text-sm text-gray-500">
             게시일: {new Date(post.createdAt).toLocaleDateString()} · 조회 {post.views}
           </p>
        </div>

        {/* Organizer Profile */}
        <div className="flex items-center p-4 bg-gray-50 rounded-xl mb-8">
           <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-lg mr-4">
              {post.author.name?.[0] || 'A'}
           </div>
           <div>
              <p className="font-bold text-gray-900">{post.author.name}</p>
              <p className="text-xs text-gray-500">주최자</p>
           </div>
        </div>

        {/* Content */}
        <div className="prose prose-indigo max-w-none mb-10 text-gray-800 leading-relaxed whitespace-pre-wrap">
           {post.content}
        </div>

        {/* Reviews Section */}
        <div className="mb-8">
            <ReviewList postId={post.id} />
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
           <div className="bg-gray-50 p-4 rounded-xl text-center">
              <p className="text-xs text-gray-500 mb-1">모집 현황</p>
              <p className="text-lg font-bold text-indigo-600">
                 {post.currentParticipants} / {post.maxParticipants}명
              </p>
           </div>
           <div className="bg-gray-50 p-4 rounded-xl text-center">
              <p className="text-xs text-gray-500 mb-1">상태</p>
              <p className={`text-lg font-bold ${post.isRecruiting ? 'text-green-600' : 'text-red-500'}`}>
                 {post.isRecruiting ? '모집중' : '마감'}
              </p>
           </div>
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex items-center justify-between safe-area-bottom max-w-5xl mx-auto">
         <div className="flex items-center space-x-4">
            <ScrapButton 
              postId={post.id} 
              initialIsScraped={isScraped} 
              initialScrapCount={post.scraps} 
            />
         </div>
         <div className="flex-1 ml-4">
             <ApplyButton postId={post.id} isRecruiting={post.isRecruiting} />
         </div>
      </div>
    </div>
  );
}
