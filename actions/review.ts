'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createReview(postId: string, userId: string, content: string) {
  // 1. Verify that the user has an APPROVED application for this post
  const application = await prisma.application.findUnique({
    where: {
      postId_userId: {
        postId,
        userId,
      },
    },
  });

  if (!application || application.status !== 'approved') {
    throw new Error('봉사활동 완료 승인을 받은 사용자만 후기를 작성할 수 있습니다.');
  }

  // 2. Check if already reviewed (optional, depending on requirements, but schema has unique constraint on postId+userId for reviews? No, schema says Review: post? author. ReviewLike is unique.
  // Wait, let's check schema.
  // model Review { ... postId String? ... authorId String ... @@map("reviews") }
  // Schema doesn't strictly enforce unique(postId, authorId) for Review model in the provided schema view in step 29.
  // However, usually one review per post per user.
  // Let's enforce it manually for now to avoid spam.

  const existingReview = await prisma.review.findFirst({
    where: {
      postId,
      authorId: userId,
    },
  });

  if (existingReview) {
    throw new Error('이미 이 봉사활동에 대한 후기를 작성하셨습니다.');
  }

  // 3. Create Review
  try {
    await prisma.review.create({
      data: {
        postId,
        authorId: userId,
        content,
      },
    });

    revalidatePath(`/board/${postId}`);
  } catch (error) {
    console.error('Error creating review:', error);
    throw new Error('후기 작성 중 오류가 발생했습니다.');
  }
}

export async function getReviews(postId: string) {
  return await prisma.review.findMany({
    where: { postId },
    include: {
      author: {
        select: {
          name: true,
          email: true,
          username: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getAllReviews() {
  try {
    return await prisma.review.findMany({
      include: {
        author: {
          select: { name: true }
        },
        post: {
          select: { title: true, id: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    return [];
  }
}
