import { getReviews } from '@/actions/review';

interface ReviewWithAuthor {
  id: string;
  content: string;
  created_at: string;
  author: {
    name: string | null;
    email: string;
    username: string;
  };
}

/** 게시글 후기 목록 컴포넌트 (서버 컴포넌트) */
export default async function ReviewList({ postId }: { postId: string }) {
  const reviews = await getReviews(postId);

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
        <p>아직 작성된 후기가 없습니다.</p>
        <p className="text-sm mt-2">첫 후기의 주인공이 되어보세요!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg text-gray-900">활동 후기 ({reviews.length})</h3>
      <ul className="space-y-4">
        {reviews.map((review: ReviewWithAuthor) => (
          <li key={review.id} className="bg-gray-50 p-4 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">
                {review.author.name && review.author.name !== 'User' ? review.author.name : review.author.username}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(review.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
              {review.content}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
