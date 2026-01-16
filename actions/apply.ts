'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function applyForPost(postId: string, userId: string) {
  // 1. Check if post exists and is recruiting
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post || !post.isRecruiting) {
    throw new Error('모집이 종료되었거나 존재하지 않는 게시글입니다.');
  }

  // 2. Check capacity
  if (post.currentParticipants >= post.maxParticipants) {
    throw new Error('모집 인원이 마감되었습니다.');
  }

  // 3. Check existing application
  const existingApp = await prisma.application.findUnique({
    where: {
      postId_userId: {
        postId,
        userId,
      },
    },
  });

  if (existingApp) {
    throw new Error('이미 신청한 봉사활동입니다.');
  }

  // 4. Create Application (Using Transaction to update count safely)
  // Note: Prisma Transactions are recommended here.
  try {
    await prisma.$transaction(async (tx) => {
      await tx.application.create({
        data: {
          postId,
          userId,
          status: 'pending',
        },
      });

      // Update current participants count?
      // Usually "pending" doesn't count towards limit until "approved"?
      // Or does it reserve a spot?
      // The requirement says: "승인 후 신청완료" -> "Approved then complete".
      // But usually we track "current_participants" as confirmed ones.
      // Let's assume for now we don't increment "currentParticipants" until approval.
      // BUT for simplicity in this MVP, let's say apply = slot reserved or just pending list.
      // Let's NOT increment participant count yet.
    });
  } catch (error) {
    console.error(error);
    throw new Error('신청 중 오류가 발생했습니다.');
  }

  revalidatePath(`/board/${postId}`);
}
