'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function toggleScrap(postId: string, userId: string) {
  try {
    const existingScrap = await prisma.postScrap.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (existingScrap) {
      // Unscrap
      await prisma.$transaction([
        prisma.postScrap.delete({
          where: { id: existingScrap.id },
        }),
        prisma.post.update({
          where: { id: postId },
          data: { scraps: { decrement: 1 } },
        }),
      ]);
    } else {
      // Scrap
      await prisma.$transaction([
        prisma.postScrap.create({
          data: {
            postId,
            userId,
          },
        }),
        prisma.post.update({
          where: { id: postId },
          data: { scraps: { increment: 1 } },
        }),
      ]);
    }

    revalidatePath(`/board/${postId}`);
    revalidatePath(`/board`); // Update list view counts
  } catch (error) {
    console.error('Error toggling scrap:', error);
    throw new Error('스크랩 처리 중 오류가 발생했습니다.');
  }
}
