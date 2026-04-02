import Link from 'next/link';
import { getMySupportTickets } from '@/actions/support';

const STATUS_LABELS = {
  pending: '대기중',
  in_progress: '처리중',
  resolved: '해결됨',
};

const CATEGORY_LABELS = {
  inquiry: '문의',
  bug: '버그 제보',
  feedback: '의견/기능 제안',
};

export default async function MySupportTicketsPage() {
  const tickets = await getMySupportTickets();

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Support</p>
            <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-slate-900">내 문의내역</h2>
          </div>
          <Link href="/mypage/support/new" className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
            새 문의 작성
          </Link>
        </div>
        <p className="mt-2 text-sm text-slate-500">내가 보낸 문의와 처리 상태를 확인할 수 있어요.</p>
      </section>

      {tickets.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-400 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
          아직 보낸 문의가 없습니다.
        </section>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <section key={ticket.id} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.04)]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{CATEGORY_LABELS[ticket.category]}</span>
                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600">{STATUS_LABELS[ticket.status]}</span>
              </div>
              <h3 className="mt-3 text-base font-bold text-slate-900">{ticket.title}</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{ticket.content}</p>
              {ticket.admin_note && (
                <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">관리자 메모</p>
                  <p className="mt-1 whitespace-pre-wrap">{ticket.admin_note}</p>
                </div>
              )}
              <p className="mt-3 text-xs text-slate-400">작성일: {new Date(ticket.created_at).toLocaleDateString()}</p>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
