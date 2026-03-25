'use client';

import { useMemo, useState } from 'react';
import { confirmAttendanceAndAwardPoints } from '@/actions/attendance';
import { useToast } from './ToastProvider';

type ParticipantUser = {
  name: string | null;
  username: string | null;
  contact: string | null;
};

export type AttendanceApplication = {
  id: string;
  status: string;
  created_at?: string;
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
  const { showToast } = useToast();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const pointsPerParticipant = Math.max(volunteerHours, 1) * 2;

  const pendingApplications = useMemo(
    () => approvedApplications.filter((application) => !application.attended_at && !application.points_awarded_at),
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

    if (!confirm(`선택한 ${selectedIds.length}명에게 참여를 확정하고 포인트를 지급할까요?`)) {
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
      window.location.reload();
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : '참여 확인 처리 중 오류가 발생했습니다.', 'error');
      setLoading(false);
    }
  };

  return (
    <section className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex flex-col gap-1 mb-4">
        <h3 className="font-bold text-gray-900">{title}</h3>
        <p className="text-xs text-gray-500">진행일: {dueDate ? new Date(dueDate).toLocaleDateString() : '-'}</p>
        <p className="text-xs font-semibold text-indigo-600">참여 확인 시 1인당 {pointsPerParticipant}P 지급</p>
      </div>

      <div className="space-y-3">
        {approvedApplications.map((application) => {
          const isCompleted = Boolean(application.attended_at || application.points_awarded_at);
          const canSelect = !isCompleted;

          return (
            <label
              key={application.id}
              className={`flex items-start gap-3 rounded-xl border p-3 ${
                isCompleted ? 'border-green-100 bg-green-50' : 'border-gray-200 bg-white'
              }`}
            >
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                checked={selectedIds.includes(application.id)}
                disabled={!canSelect || loading}
                onChange={() => toggleSelection(application.id)}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-gray-900 truncate">
                    {application.users?.name && application.users.name !== 'User'
                      ? application.users.name
                      : application.users?.username || '이름 없음'}
                  </p>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full ${
                      isCompleted ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {isCompleted ? '참여 확인 완료' : '확인 대기'}
                  </span>
                </div>
                <p className="text-sm text-gray-500">@{application.users?.username || 'unknown'}</p>
                {application.users?.contact && <p className="text-sm text-gray-600 mt-1">연락처: {application.users.contact}</p>}
                {isCompleted && (
                  <p className="text-xs text-gray-500 mt-1">처리 시각: {formatDateTime(application.attended_at || application.points_awarded_at)}</p>
                )}
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
          className="mt-4 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? '처리 중...' : `선택한 참여자 확인 및 포인트 지급 (${selectedIds.length}명)`}
        </button>
      ) : (
        <p className="mt-4 text-sm text-gray-500 text-center">이 게시글은 참석 확인이 모두 끝났습니다.</p>
      )}
    </section>
  );
}
