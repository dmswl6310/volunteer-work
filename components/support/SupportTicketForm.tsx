'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupportTicket } from '@/actions/support';
import { useToast } from '@/components/ToastProvider';
import { SUPPORT_CATEGORY_LABELS, type SupportTicketCategory } from '@/lib/support';

const CATEGORY_OPTIONS: Array<{ value: SupportTicketCategory; label: string; description: string }> = [
  { value: 'inquiry', label: SUPPORT_CATEGORY_LABELS.inquiry, description: '서비스 이용 중 궁금한 점을 남겨주세요.' },
  { value: 'bug', label: SUPPORT_CATEGORY_LABELS.bug, description: '오류나 예상과 다른 동작을 알려주세요.' },
  { value: 'feedback', label: SUPPORT_CATEGORY_LABELS.feedback, description: '추가되면 좋을 기능이나 개선 아이디어를 남겨주세요.' },
];

export default function SupportTicketForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    category: 'inquiry' as SupportTicketCategory,
    title: '',
    content: '',
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      await createSupportTicket(form);
      showToast('문의가 접수되었습니다. 확인 후 답변드릴게요.', 'success');
      router.push('/mypage');
      router.refresh();
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : '문의 접수 중 오류가 발생했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">문의 종류</label>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {CATEGORY_OPTIONS.map((option) => {
            const selected = form.category === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setForm((current) => ({ ...current, category: option.value }))}
                className={`rounded-2xl border px-4 py-3 text-left transition-colors ${selected ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}
              >
                <p className="text-sm font-semibold">{option.label}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{option.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label htmlFor="support-title" className="block text-sm font-medium text-slate-700">제목</label>
        <input
          id="support-title"
          value={form.title}
          onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
          className="mt-2 block w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          placeholder="문의 제목을 입력해 주세요"
          maxLength={100}
          required
        />
      </div>

      <div>
        <label htmlFor="support-content" className="block text-sm font-medium text-slate-700">내용</label>
        <textarea
          id="support-content"
          value={form.content}
          onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
          className="mt-2 block min-h-[220px] w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          placeholder="문의 내용을 자세히 적어주세요. 버그 제보라면 재현 방법을 같이 남겨주시면 더 빨리 확인할 수 있어요."
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-amber-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
      >
        {loading ? '접수 중...' : '문의 보내기'}
      </button>
    </form>
  );
}
