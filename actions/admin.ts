'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function approveUser(userId: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isApproved: true },
    });
    revalidatePath('/admin');
  } catch (error) {
    console.error('Error approving user:', error);
    throw new Error('사용자 승인 중 오류가 발생했습니다.');
  }
}

export async function approveApplication(applicationId: string) {
  try {
    // Transaction to update application status and increment participant count
    await prisma.$transaction(async (tx) => {
      const app = await tx.application.update({
        where: { id: applicationId },
        data: { status: 'approved' },
        include: { post: true },
      });

      if (!app) throw new Error('신청 내역을 찾을 수 없습니다.');

      // Check capacity again just in case
      if (app.post.currentParticipants >= app.post.maxParticipants) {
        throw new Error('모집 인원이 초과되었습니다.');
      }

      await tx.post.update({
        where: { id: app.postId },
        data: {
          currentParticipants: {
            increment: 1,
          },
        },
      });
    });

    revalidatePath('/admin');
  } catch (error) {
    console.error('Error approving application:', error);
    throw new Error('신청 승인 중 오류가 발생했습니다.');
  }
}

export async function rejectApplication(applicationId: string) {
  try {
    await prisma.application.update({
      where: { id: applicationId },
      data: { status: 'rejected' },
    });
    revalidatePath('/admin');
  } catch (error) {
    console.error('Error rejecting application:', error);
  }
}


export async function getAdminDashboardData() {
  try {
    const pendingUsers = await prisma.user.findMany({
      where: { isApproved: false },
      orderBy: { createdAt: 'desc' },
    });
    return pendingUsers;
  } catch (error) {
    console.error('Error fetching admin data:', error);
    return [];
  }
}

