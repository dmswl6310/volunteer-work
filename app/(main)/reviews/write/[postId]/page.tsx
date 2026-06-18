'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createReview } from '@/actions/review';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ToastProvider';
import { Loader2 } from 'lucide-react';

export default function WriteReviewPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.postId as string;
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showToast('로그인 후 이용해 주세요.', 'warning');
        router.push('/auth/login');
        return;
      }

      const result = await createReview(postId, content);

      if (result?.error) {
        showToast(result.error, 'warning');
        return;
      }

      showToast('소중한 활동 후기가 성공적으로 등록되었습니다.', 'success');
      router.push(`/board/${postId}`);
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : '후기 등록 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl bg-slate-50/70 px-4 py-8 min-h-screen">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Write review</p>
      <h1 className="mb-6 mt-1 text-2xl font-semibold tracking-[-0.02em] text-slate-900">봉사활동 후기 작성</h1>

      <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
        <div className="mb-4">
          <label htmlFor="content" className="mb-2 block text-sm font-medium text-slate-700">
            후기 내용
          </label>
          <textarea
            id="content"
            rows={6}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="봉사활동은 어떠셨나요? 솔직한 후기를 남겨주세요."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>등록 중...</span>
            </>
          ) : (
            '후기 등록하기'
          )}
        </button>
      </form>
    </div>
  );
}
