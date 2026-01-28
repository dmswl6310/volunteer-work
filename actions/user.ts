'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getMyPageData(userId: string, email?: string, name?: string) {
    try {
        let user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                applications: {
                    include: { post: true },
                    orderBy: { createdAt: 'desc' }
                },
                postScraps: {
                    include: { post: true },
                    orderBy: { createdAt: 'desc' }
                },
                posts: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        applications: {
                            where: { status: 'pending' },
                            include: { user: true }
                        }
                    }
                },
                reviews: {
                    include: { post: true },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        // Auto-heal if missing
        if (!user && email) {
            console.warn(`User ${userId} missing in MyPage. Auto-healing...`);
            const emailPrefix = email.split('@')[0];
            let newUsername = emailPrefix;
            let counter = 1;
            while (await prisma.user.findUnique({ where: { username: newUsername } })) {
                newUsername = `${emailPrefix}${counter}`;
                counter++;
            }

            user = await prisma.user.create({
                data: {
                    id: userId,
                    email: email,
                    username: newUsername,
                    name: name || 'User',
                    contact: '010-0000-0000',
                    address: 'Unknown',
                    job: 'Unknown',
                    role: 'user',
                    isApproved: true
                },
                include: {
                    applications: { include: { post: true } },
                    postScraps: { include: { post: true } },
                    posts: { include: { applications: { include: { user: true } } } },
                    reviews: { include: { post: true } }
                }
            });
        }

        return user;
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw new Error('Failed to load user data');
    }
}
