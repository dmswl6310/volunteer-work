/**
 * 신청 상태 배지 컴포넌트
 * pending(대기), approved(승인), rejected(반려), confirmed(완료), cancelled(취소)
 */
export default function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'border border-amber-200 bg-amber-50 text-amber-700',
    approved: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
    rejected: 'border border-rose-200 bg-rose-50 text-rose-700',
    confirmed: 'border border-indigo-200 bg-indigo-50 text-indigo-700',
    cancelled: 'border border-slate-200 bg-slate-100 text-slate-600',
  };

  const labels: Record<string, string> = {
    pending: '대기',
    approved: '승인',
    rejected: '반려',
    confirmed: '완료',
    cancelled: '취소',
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status] || 'border border-slate-200 bg-slate-100 text-slate-600'}`}>
      {labels[status] || status}
    </span>
  );
}
