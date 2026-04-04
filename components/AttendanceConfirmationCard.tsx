'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { confirmAttendanceAndAwardPoints } from '@/actions/attendance';
import { useToast } from './ToastProvider';

type ParticipantUser = {
  username: string | null;
  contact: string | null;
};

export type AttendanceApplication = {
  id: string;
  status: string;
  created_at?: string;
  attendance_marked_by?: string | null;
  attended_at?: string | null;
  points_awarded_at?: string | null;
  users: ParticipantUser | null;
};

type Props = {
  postId: string;
  title: string;
  dueDate?: string | null;
  volunteerHours: number;
  approvedApplications: AttendanceApplication[];
};

function formatDateTime(value?: string | null) {
  return value ? new Date(value).toLocaleString() : '-';
}

export default function AttendanceConfirmationCard({
  postId,
  title,
  dueDate,
  volunteerHours,
  approvedApplications,
}: Props) {
  const router = useRouter();
  const { showToast, showConfirm } = useToast();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const pointsPerParticipant = Math.max(volunteerHours, 1) * 2;

  const pendingApplications = useMemo(
    () => approvedApplications.filter((application) => !application.attendance_marked_by && !application.attended_at && !application.points_awarded_at),
    [approvedApplications]
  );

  const toggleSelection = (applicationId: string) => {
    setSelectedIds((current) =>
      current.includes(applicationId)
        ? current.filter((id) => id !== applicationId)
        : [...current, applicationId]
    );
  };

  const handleConfirm = async () => {
    if (selectedIds.length === 0) {
      showToast('참여 확인할 신청자를 선택해 주세요.', 'warning');
      return;
    }

    const confirmed = await showConfirm(`선택한 ${selectedIds.length}명에게 참여를 확정하고 포인트를 지급할까요?`, {
      title: '참여 확인 및 포인트 지급',
      confirmLabel: '지급하기',
    });
    if (!confirmed) {
      return;
    }

    setLoading(true);
    try {
      const result = await confirmAttendanceAndAwardPoints(postId, selectedIds);
      if (result.awardedCount === 0) {
        showToast('이미 처리되었거나 지급 가능한 신청자가 없습니다.', 'warning');
      } else {
        showToast(`총 ${result.awardedCount}명에게 ${result.awardedPoints}P씩 지급했습니다.`, 'success');
      }
      router.refresh();
      setLoading(false);
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : '참여 확인 처리 중 오류가 발생했습니다.', 'error');
      setLoading(false);
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.04)]">
      <div className="mb-4 flex flex-col gap-1">
        <Link href={`/board/${postId}`} className="font-semibold text-slate-900 underline-offset-2 transition-colors hover:text-slate-800 hover:underline">
          {title}
        </Link>
        <p className="text-xs text-slate-500">진행일: {dueDate ? new Date(dueDate).toLocaleDateString() : '-'}</p>
        <p className="text-xs font-medium text-slate-500">참여 확인 시 1인당 {pointsPerParticipant}P 지급</p>
      </div>

      <div className="space-y-3">
        {approvedApplications.map((application) => {
          const isCompleted = Boolean(application.attendance_marked_by || application.attended_at || application.points_awarded_at);
          const canSelect = !isCompleted;
          const isUnattended = Boolean(application.attendance_marked_by && !application.attended_at && !application.points_awarded_at);

          return (
            <label
              key={application.id}
              className={`flex items-start gap-3 rounded-2xl border p-3 transition-colors ${
                isCompleted ? 'border-emerald-200 bg-emerald-50/70' : 'border-slate-200 bg-slate-50/40 hover:border-slate-300 hover:bg-white'
              }`}
            >
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                checked={selectedIds.includes(application.id)}
                disabled={!canSelect || loading}
                onChange={() => toggleSelection(application.id)}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-semibold text-slate-900">
                      {application.users?.username || '이름 없음'}
                    </p>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        isCompleted ? 'border border-emerald-200 bg-emerald-50 text-emerald-700' : 'border border-amber-200 bg-amber-50 text-amber-700'
                      }`}
                    >
                      {isCompleted ? (isUnattended ? '미참석 처리' : '참여 확인 완료') : '확인 대기'}
                    </span>
                  </div>
                {application.users?.contact && <p className="mt-1 text-sm text-slate-600">연락처: {application.users.contact}</p>}
                {!isUnattended && isCompleted && (
                  <p className="mt-1 text-xs text-slate-500">처리 시각: {formatDateTime(application.attended_at || application.points_awarded_at || application.attendance_marked_by)}</p>
                )}
                {isUnattended && <p className="mt-1 text-xs text-slate-500">이번 참여 확인에서 미참석으로 처리되었습니다.</p>}
              </div>
            </label>
          );
        })}
      </div>

      {pendingApplications.length > 0 ? (
        <button
          type="button"
          onClick={handleConfirm}
          disabled={loading || selectedIds.length === 0}
          className="mt-4 w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(79,70,229,0.22)] transition-colors hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? '처리 중...' : `선택한 참여자 확인 및 포인트 지급 (${selectedIds.length}명)`}
        </button>
        ) : (
        <p className="mt-4 text-center text-sm text-slate-500">이 게시글은 참석 확인 처리가 끝났습니다.</p>
      )}
    </section>
  );
}
