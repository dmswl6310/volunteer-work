import { getAllReviews } from '@/actions/review';
import { createServerSupabaseClient } from '@/lib/supabase';
import Link from 'next/link';
import ReviewLikeButton from '@/components/ReviewLikeButton';

export const dynamic = 'force-dynamic';

export default async function ReviewPage() {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    const reviews = await getAllReviews(user?.id);

    return (
        <div className="pb-24 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="bg-white px-4 py-3 border-b border-gray-100 sticky top-0 z-30 shadow-sm">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">봉사활동 후기</h1>
            </div>

            <div className="p-4 space-y-4">
                {reviews.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        등록된 후기가 없습니다.
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                            <Link href={`/board/${review.post_id}`} className="block mb-3">
                                <span className="mb-2 inline-block rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-600">
                                    {review.posts?.title || '삭제된 활동'}
                                </span>
                            </Link>
                            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap mb-4">
                                {review.content}
                            </p>
                            <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-100 pt-3">
                                <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold text-[10px]">
                                        {review.author?.username?.[0] || 'U'}
                                    </div>
                                    <span>{review.author?.username || '익명'}</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <ReviewLikeButton
                                        reviewId={review.id}
                                        initialIsLiked={review.is_liked}
                                        initialLikeCount={review.like_count}
                                    />
                                    <span>{new Date(review.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
