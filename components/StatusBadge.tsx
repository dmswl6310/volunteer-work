/**
 * 신청 상태 배지 컴포넌트
 * pending(대기), approved(승인), rejected(반려), confirmed(완료), cancelled(취소)
 */
export default function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    confirmed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };

  const labels: Record<string, string> = {
    pending: '대기',
    approved: '승인',
    rejected: '반려',
    confirmed: '완료',
    cancelled: '취소',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold ${styles[status] || 'bg-gray-100'}`}>
      {labels[status] || status}
    </span>
  );
}
