import { getAllReviews } from '@/actions/review';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ReviewPage() {
    const reviews = await getAllReviews();

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
                        <div key={review.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                            <Link href={`/board/${review.post_id}`} className="block mb-3">
                                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded mb-2 inline-block">
                                    {review.posts?.title || '삭제된 활동'}
                                </span>
                            </Link>
                            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap mb-4">
                                {review.content}
                            </p>
                            <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-100 pt-3">
                                <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold text-[10px]">
                                        {review.author?.name?.[0] || 'U'}
                                    </div>
                                    <span>{review.author?.name || '익명'}</span>
                                </div>
                                <span>{new Date(review.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
