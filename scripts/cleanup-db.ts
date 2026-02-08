
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Starting cleanup...');

    // 1. Find non-admin users
    const usersToDelete = await prisma.user.findMany({
        where: {
            role: {
                not: 'admin'
            }
        },
        select: { id: true }
    });

    const userIds = usersToDelete.map((u: any) => u.id);
    console.log(`Found ${userIds.length} non-admin users to delete.`);

    if (userIds.length === 0) {
        console.log('No users to delete.');
        return;
    }

    // 2. Initial Deletions (Dependencies)
    // Delete ReviewLikes by these users
    const deleteReviewLikes = prisma.reviewLike.deleteMany({
        where: { userId: { in: userIds } }
    });

    // Delete PostScraps by these users
    const deletePostScraps = prisma.postScrap.deleteMany({
        where: { userId: { in: userIds } }
    });

    // Delete Applications by these users
    const deleteApplications = prisma.application.deleteMany({
        where: { userId: { in: userIds } }
    });

    // 3. Complex Deletions (Content with potential dependencies)
    // Delete Reviews by these users (and their likes first?)
    // Likes on these reviews need to be deleted.
    // Find reviews by these users
    const reviewsToDelete = await prisma.review.findMany({
        where: { authorId: { in: userIds } },
        select: { id: true }
    });
    const reviewIds = reviewsToDelete.map((r: any) => r.id);

    // Delete likes on these reviews (even from admin)
    const deleteLikesOnReviews = prisma.reviewLike.deleteMany({
        where: { reviewId: { in: reviewIds } }
    });

    // Now delete the reviews
    const deleteReviews = prisma.review.deleteMany({
        where: { id: { in: reviewIds } }
    });


    // Delete Posts by these users
    // Posts have: applications, reviews, scraps, etc.
    // We need to find posts by these users
    const postsToDelete = await prisma.post.findMany({
        where: { authorId: { in: userIds } },
        select: { id: true }
    });
    const postIds = postsToDelete.map((p: any) => p.id);

    // Delete dependent data for these posts
    const deleteAppsOnPosts = prisma.application.deleteMany({
        where: { postId: { in: postIds } }
    });
    const deleteScrapsOnPosts = prisma.postScrap.deleteMany({
        where: { postId: { in: postIds } }
    });
    const deleteReviewsOnPosts = prisma.review.deleteMany({
        where: { postId: { in: postIds } }
    }); // Note: we might have already deleted some reviews if author was deleted, but this catches reviews by OTHERS on these posts.
    // Wait, if I delete a post, I must delete reviews on it.
    // Above I deleted reviews trigger by AUTHOR.
    // Now I delete reviews triggered by POST.

    // 4. Finally Delete Posts and Users
    const deletePosts = prisma.post.deleteMany({
        where: { id: { in: postIds } }
    });

    const deleteUsers = prisma.user.deleteMany({
        where: { id: { in: userIds } }
    });

    // Execute in transaction (or order)
    // Since some logic required fetching IDs (reviews, posts), we can't do one big transaction easily with raw deleteMany unless we use cascade.
    // We will run them in sequence.

    console.log('Deleting dependent data...');
    await prisma.$transaction([
        deleteReviewLikes,
        deletePostScraps,
        deleteApplications, // Applications by users
        deleteLikesOnReviews,
        deleteReviews, // Reviews by users
        deleteAppsOnPosts, // Apps on posts by users
        deleteScrapsOnPosts, // Scraps on posts by users
        deleteReviewsOnPosts, // Reviews on posts by users
    ]);

    console.log('Deleting content and users...');
    await prisma.$transaction([
        deletePosts,
        deleteUsers
    ]);

    console.log('Cleanup completed successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
