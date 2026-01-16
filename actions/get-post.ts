'use server';

import prisma from '@/lib/prisma';

export async function getPost(id: string) {
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
           select: {
             id: true,
             name: true,
             email: true,
             contact: true, // Needed for admin/organizer? Maybe hide for general users? Let's show for now or handle visibility.
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
