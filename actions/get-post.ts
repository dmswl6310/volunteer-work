'use server';

import prisma from '@/lib/prisma';

export async function getPost(id: string) {
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            name: true,
            email: true,
            contact: true,
            username: true, // Needed for display logic
          }
        },
        _count: {
          select: { reviews: true }
        }
      },
    });
    return post;
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}
