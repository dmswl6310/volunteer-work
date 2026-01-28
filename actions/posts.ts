'use server';

import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export type PostWithAuthor = Prisma.PostGetPayload<{
  include: { author: { select: { name: true; email: true } } };
}>;

export async function getPosts({
  page = 1,
  limit = 10,
  sort = 'latest',
  category,
}: {
  page?: number;
  limit?: number;
  sort?: 'latest' | 'popular' | 'views';
  category?: string;
}) {
  const skip = (page - 1) * limit;

  const where: Prisma.PostWhereInput = {
    isRecruiting: true, // Only show active posts by default
    ...(category && { category: { contains: category } }),
  };

  let orderBy: Prisma.PostOrderByWithRelationInput = { createdAt: 'desc' };

  if (sort === 'popular') {
    orderBy = { scraps: 'desc' }; // Assuming scraps indicate popularity
  } else if (sort === 'views') {
    orderBy = { views: 'desc' };
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
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { name: true },
        },
      },
    });
    return posts;
  } catch (error) {
    console.error('Error fetching urgent posts:', error);
    return [];
  }
}
