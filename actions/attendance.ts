'use server';

import { revalidatePath } from 'next/cache';
import { requireApprovedUser } from '@/lib/server-auth';

type AttendanceResult = {
  awardedCount: number;
  awardedPoints: number;
};

export async function confirmAttendanceAndAwardPoints(postId: string, applicationIds: string[]) {
  const { supabase } = await requireApprovedUser();

  if (!postId) {
    throw new Error('게시글 정보가 올바르지 않습니다.');
  }

  if (applicationIds.length === 0) {
    throw new Error('참여 확인할 신청자를 선택해 주세요.');
  }

  const { data, error } = await supabase.rpc('confirm_attendance_and_award_points', {
    target_post_id: postId,
    target_application_ids: applicationIds,
  });

  if (error) {
    throw new Error(error.message || '참여 확인 처리 중 오류가 발생했습니다.');
  }

  const result = (data ?? { awardedCount: 0, awardedPoints: 0 }) as AttendanceResult;

  revalidatePath('/mypage');
  revalidatePath(`/board/${postId}`);

  return result;
}
