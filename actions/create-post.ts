'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const category = formData.get('category') as string;
  const maxParticipants = parseInt(formData.get('maxParticipants') as string);
  const userId = formData.get('userId') as string;
  const imageUrl = formData.get('imageUrl') as string;
  const isUrgent = formData.get('isUrgent') === 'true';
  const dueDateStr = formData.get('dueDate') as string;

  if (!userId) {
    throw new Error('Unauthorized');
  }

  // Basic Validation
  if (!title || !content || !category) {
    throw new Error('필수 항목을 입력해주세요.');
  }

  const dueDate = dueDateStr ? new Date(dueDateStr) : null;

  try {
     await prisma.post.create({
      data: {
        title,
        content,
        category,
        maxParticipants,
        authorId: userId,
        imageUrl,
        isRecruiting: true,
        isUrgent,
        dueDate
      },
    });
  } catch (error) {
    console.error(error);
    throw new Error('게시글 작성 실패');
  }

  revalidatePath('/board');
  redirect('/board');
}
