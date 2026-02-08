'use server';

import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export type PostWithAuthor = Prisma.PostGetPayload<{
  include: { author: { select: { name: true; email: true; username: true } } };
}>;

export async function getPosts({
  page = 1,
  limit = 10,
  sort = 'latest',
  category,
  status = 'recruiting',
}: {
  page?: number;
  limit?: number;
  sort?: 'latest' | 'deadline';
  category?: string;
  status?: 'recruiting' | 'closed' | 'all';
}) {
  const skip = (page - 1) * limit;
  const now = new Date();

  // Build where clause based on status
  const where: Prisma.PostWhereInput = {};

  if (category) {
    where.category = { contains: category };
  }

  if (status === 'recruiting') {
    where.AND = [
      { isRecruiting: true },
      { dueDate: { gte: now } }
    ];
  } else if (status === 'closed') {
    where.OR = [
      { isRecruiting: false },
      { dueDate: { lt: now } }
    ];
  }
  // if status === 'all', we don't add restrictions on isRecruiting/dueDate

  let orderBy: Prisma.PostOrderByWithRelationInput | Prisma.PostOrderByWithRelationInput[] = { createdAt: 'desc' };

  if (sort === 'deadline') {
    // Sort by due date ascending (soonest first), then by creation date
    orderBy = [
        { dueDate: 'asc' }, 
        { createdAt: 'desc' }
    ];
  }

  try {
    const posts = await prisma.post.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        author: {
          select: {
            name: true,
            email: true,
            username: true, // Nickname
          },
        },
      },
    });

    return { posts, nextId: posts.length === limit ? page + 1 : null };
  } catch (error) {
    console.error('Error fetching posts:', error);
    return { posts: [], nextId: null };
  }
}

export async function getUrgentPosts() {
  try {
    const posts = await prisma.post.findMany({
      where: {
        isUrgent: true,
        isRecruiting: true,
      },
      take: 10, 
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { name: true, username: true },
        },
      },
    });
    return posts;
  } catch (error) {
    console.error('Error fetching urgent posts:', error);
    return [];
  }
}
