export type PostStatusInput = {
  dueDate?: string | null;
  isRecruiting: boolean;
  currentParticipants: number;
  maxParticipants: number;
};

function normalizeDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function getPostStatus({ dueDate, isRecruiting, currentParticipants, maxParticipants }: PostStatusInput) {
  const today = normalizeDate(new Date().toISOString())!;
  const normalizedDueDate = normalizeDate(dueDate);
  const isExpired = normalizedDueDate ? normalizedDueDate < today : false;
  const isFull = currentParticipants >= maxParticipants;
  const isClosed = !isRecruiting || isExpired;
  const diffDays = normalizedDueDate
    ? Math.ceil((normalizedDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return {
    dueDate: normalizedDueDate,
    isExpired,
    isFull,
    isClosed,
    diffDays,
    isOpenRecruiting: isRecruiting && !isExpired && !isFull,
  };
}

export function getUrgentStatusLabel(status: ReturnType<typeof getPostStatus>) {
  if (status.diffDays === null) return '상시 모집';
  if (status.isOpenRecruiting) {
    return status.diffDays > 0 ? `D-${status.diffDays}` : 'D-Day';
  }
  if (status.isFull && !status.isExpired) return '모집 완료';
  return '마감';
}
