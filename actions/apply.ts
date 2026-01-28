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

  // Check due date if exists
  if (post.dueDate && new Date(post.dueDate) < new Date()) {
      throw new Error('마감 기한이 지났습니다.');
  }

  // 2. Check capacity (Rough check, strictly check on approval)
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

  // 4. Create Application
  try {
      await prisma.application.create({
        data: {
          postId,
          userId,
          status: 'pending',
        },
      });
  } catch (error) {
    console.error(error);
    throw new Error('신청 중 오류가 발생했습니다.');
  }

  revalidatePath(`/board/${postId}`);
}

export async function updateApplicationStatus(applicationId: string, newStatus: 'approved' | 'rejected') {
    const app = await prisma.application.findUnique({
        where: { id: applicationId },
        include: { post: true }
    });

    if (!app) throw new Error('신청 내역을 찾을 수 없습니다.');
    if (app.status === newStatus) return; // No change

    try {
        await prisma.$transaction(async (tx) => {
            // If approving, increment count
            if (newStatus === 'approved' && app.status !== 'approved') {
                if (app.post.currentParticipants >= app.post.maxParticipants) {
                    throw new Error('모집 인원이 초과되어 승인할 수 없습니다.');
                }
                await tx.post.update({
                    where: { id: app.postId },
                    data: { currentParticipants: { increment: 1 } }
                });
            }
            // If was approved and now rejecting (unlikely flow but possible), decrement?
            // User flow: Pending -> Approve/Reject.
            // If Confirmed -> Reject?
            
            await tx.application.update({
                where: { id: applicationId },
                data: { status: newStatus }
            });
        });
    } catch (error: any) {
        throw new Error(error.message || '상태 변경 중 오류가 발생했습니다.');
    }

    revalidatePath('/mypage');
}

export async function cancelApplication(applicationId: string) {
    const app = await prisma.application.findUnique({
        where: { id: applicationId },
        include: { post: true }
    });
    
    if (!app) throw new Error('신청 내역을 찾을 수 없습니다.');

    try {
        await prisma.$transaction(async (tx) => {
            if (app.status === 'approved' || app.status === 'confirmed') {
                await tx.post.update({
                    where: { id: app.postId },
                    data: { currentParticipants: { decrement: 1 } }
                });
            }
            await tx.application.delete({
                where: { id: applicationId }
            });
        });
    } catch (error) {
        console.error(error);
        throw new Error('취소 처리 중 오류가 발생했습니다.');
    }
    revalidatePath('/mypage');
    revalidatePath(`/board/${app.postId}`);
}
