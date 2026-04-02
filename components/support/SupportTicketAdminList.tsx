'use client';

import { useState } from 'react';
import { updateSupportTicketStatus } from '@/actions/support';
import { useToast } from '@/components/ToastProvider';
import {
  SUPPORT_CATEGORY_LABELS,
  SUPPORT_STATUS_LABELS,
  type SupportTicket,
  type SupportTicketStatus,
} from '@/lib/support';

export default function SupportTicketAdminList({ tickets }: { tickets: SupportTicket[] }) {
  const { showToast } = useToast();
  const [loadingTicketId, setLoadingTicketId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const handleStatusChange = async (ticketId: string, status: SupportTicketStatus) => {
    setLoadingTicketId(ticketId);
    try {
      await updateSupportTicketStatus({
        ticketId,
        status,
        adminNote: notes[ticketId],
      });
      showToast('문의 상태를 업데이트했습니다.', 'success');
      window.location.reload();
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : '문의 상태 변경 중 오류가 발생했습니다.', 'error');
      setLoadingTicketId(null);
    }
  };

  return (
    <div className="space-y-3">
      {tickets.map((ticket) => (
        <div key={ticket.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{SUPPORT_CATEGORY_LABELS[ticket.category]}</span>
                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600">{SUPPORT_STATUS_LABELS[ticket.status]}</span>
              </div>
              <h3 className="mt-2 text-base font-bold text-slate-900">{ticket.title}</h3>
              <p className="mt-1 text-xs text-slate-500">{ticket.username_snapshot || '알 수 없음'} · {ticket.email_snapshot || '-'} · {new Date(ticket.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm text-slate-700 whitespace-pre-wrap">
            {ticket.content}
          </div>

          <textarea
            value={notes[ticket.id] ?? ticket.admin_note ?? ''}
            onChange={(event) => setNotes((current) => ({ ...current, [ticket.id]: event.target.value }))}
            className="mt-3 block min-h-[96px] w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="관리자 메모를 남길 수 있습니다."
          />

          <div className="mt-3 flex flex-wrap gap-2">
            {(['pending', 'in_progress', 'resolved'] as SupportTicketStatus[]).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => void handleStatusChange(ticket.id, status)}
                disabled={loadingTicketId === ticket.id}
                className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${ticket.status === status ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {SUPPORT_STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
