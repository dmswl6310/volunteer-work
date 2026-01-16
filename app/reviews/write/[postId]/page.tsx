'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { createReview } from '@/actions/review';
import { supabase } from '@/lib/supabase';

export default function WriteReviewPage(props: { params: Promise<{ postId: string }> }) {
  const params = use(props.params);
  const router = useRouter();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('로그인이 필요합니다.');
        router.push('/auth/login');
        return;
      }

      await createReview(params.postId, user.id, content);
      alert('후기가 등록되었습니다.');
      router.push(`/board/${params.postId}`);
    } catch (error: any) {
      alert(error.message);
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
