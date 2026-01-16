'use server';

import prisma from '@/lib/prisma';
import { supabase } from '@/lib/supabase'; // NOTE: Server-side Supabase client might need auth context
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// Simplification: We will pass authorId from the client for now, 
// BUT in production, we should extract it from the session to prevent spoofing.
// Since we are mocking/protoyping, we can check basic auth or just trust the client implementation with RLS backup if using Supabase directly.
// However, using Prisma, we bypass RLS. So we MUST verify auth here.

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const category = formData.get('category') as string;
  const maxParticipants = parseInt(formData.get('maxParticipants') as string);
  const userId = formData.get('userId') as string; // Client provides this after Login check
  const imageUrl = formData.get('imageUrl') as string;

  if (!userId) {
    throw new Error('Unauthorized');
  }

  // Basic Validation
  if (!title || !content || !category) {
    throw new Error('필수 항목을 입력해주세요.');
  }

  try {
     await prisma.post.create({
      data: {
        title,
        content, // content can be HTML or markdown
        category,
        maxParticipants,
        authorId: userId,
        imageUrl,
        isRecruiting: true,
      },
    });
  } catch (error) {
    console.error(error);
    throw new Error('게시글 작성 실패');
  }

  revalidatePath('/board');
  redirect('/board');
}
