import { getReviews } from '@/actions/review';
import ReviewLikeButton from './ReviewLikeButton';

/** 게시글 후기 목록 컴포넌트 (서버 컴포넌트) */
export default async function ReviewList({ postId, userId, canInteract }: { postId: string; userId?: string; canInteract: boolean }) {
  const reviews = await getReviews(postId, userId);

  if (reviews.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 py-10 text-center text-slate-500">
        <p>아직 작성된 후기가 없습니다.</p>
        <p className="mt-2 text-sm">후기는 참여 완료 후 작성할 수 있습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Reviews</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">활동 후기 ({reviews.length})</h3>
        </div>
      </div>
      <ul className="space-y-4">
        {reviews.map((review) => (
          <li key={review.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-medium text-slate-900">
                {review.author?.username || '익명'}
              </span>
              <span className="text-xs text-slate-400">
                {new Date(review.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="mb-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
              {review.content}
            </p>
            <div className="flex justify-end">
              <ReviewLikeButton
                reviewId={review.id}
                initialIsLiked={review.is_liked}
                initialLikeCount={review.like_count}
                canInteract={canInteract}
                returnTo={`/board/${postId}`}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
