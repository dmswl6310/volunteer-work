import { getDateKstKey, getTodayKstKey } from '@/lib/date-kst';

export type PostStatusInput = {
  dueDate?: string | null;
  isRecruiting: boolean;
  currentParticipants: number;
  maxParticipants: number;
};

export function getPostStatus({ dueDate, isRecruiting, currentParticipants, maxParticipants }: PostStatusInput) {
  const todayKey = getTodayKstKey();
  const dueDateKey = getDateKstKey(dueDate);
  const isExpired = Boolean(dueDateKey && todayKey && dueDateKey < todayKey);
  const isFull = currentParticipants >= maxParticipants;
  const isClosed = !isRecruiting || isExpired;
  const diffDays = dueDateKey && todayKey
    ? Math.round((new Date(`${dueDateKey}T00:00:00+09:00`).getTime() - new Date(`${todayKey}T00:00:00+09:00`).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return {
    dueDate: dueDateKey ? new Date(`${dueDateKey}T00:00:00+09:00`) : null,
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
