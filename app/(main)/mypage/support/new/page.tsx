import Link from 'next/link';
import SupportTicketForm from '@/components/support/SupportTicketForm';

export default function NewSupportTicketPage() {
  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Support</p>
            <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-slate-900">문의하기</h2>
          </div>
          <Link href="/mypage" className="text-xs font-semibold text-indigo-600 hover:underline">
            내 정보로 돌아가기
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-6 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
        <SupportTicketForm />
      </section>
    </div>
  );
}
