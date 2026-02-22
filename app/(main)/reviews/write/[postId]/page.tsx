'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createReview } from '@/actions/review';
import { supabase } from '@/lib/supabase';

export default function WriteReviewPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.postId as string;
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('로그인 후 이용해 주세요.');
        router.push('/auth/login');
        return;
      }

      await createReview(postId, user.id, content);
      alert('소중한 활동 후기가 성공적으로 등록되었습니다.');
      router.push(`/board/${postId}`);
    } catch (error: any) {
      alert(error.message || '후기 등록 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">봉사활동 후기 작성</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            후기 내용
          </label>
          <textarea
            id="content"
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="봉사활동은 어떠셨나요? 솔직한 후기를 남겨주세요."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? '등록 중...' : '후기 등록하기'}
        </button>
      </form>
    </div>
  );
}
