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
        <div className="min-h-screen bg-slate-50/70 pb-24">
            {/* Header */}
            <div className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Reviews</p>
                <h1 className="text-xl font-semibold tracking-[-0.02em] text-slate-900">봉사활동 후기</h1>
            </div>

            <div className="p-4 space-y-4">
                {reviews.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-200 bg-white py-20 text-center text-slate-400">
                        등록된 후기가 없습니다.
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id} className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.04)]">
                            <Link href={`/board/${review.post_id}`} className="block mb-3">
                                <span className="mb-2 inline-block rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                                    {review.posts?.title || '삭제된 활동'}
                                </span>
                            </Link>
                            <p className="mb-4 whitespace-pre-wrap leading-relaxed text-slate-800">
                                {review.content}
                            </p>
                            <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                                <div className="flex items-center space-x-2">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 font-bold text-[10px] text-slate-600">
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
