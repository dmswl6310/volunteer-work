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
  const email = formData.get('email') as string;
  const name = formData.get('name') as string;

  try {
    // 1. Check if user exists in DB
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });

    // 2. If user does not exist, AUTO-HEAL (Create the user)
    if (!userExists) {
      console.warn(`User ${userId} not found in DB. Auto-creating...`);

      if (!email) {
        throw new Error('User email not provided for auto-registration.');
      }

      const emailPrefix = email.split('@')[0];
      let newUsername = emailPrefix;

      // Ensure username uniqueness
      let counter = 1;
      while (await prisma.user.findUnique({ where: { username: newUsername } })) {
        newUsername = `${emailPrefix}${counter}`;
        counter++;
      }

      await prisma.user.create({
        data: {
          id: userId,
          email: email,
          username: newUsername,
          name: name || 'User', // Use provided name
          contact: '010-0000-0000', // Default contact
          address: 'Unknown', // Default address
          job: 'Unknown', // Default job
          role: 'user',
          isApproved: true, // Auto-approve for now or false depending on logic
        },
      });
      console.log(`User ${userId} auto-created.`);
    }

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
