import { PrismaClient } from '@prisma/client';
import { applyForPost } from '../actions/apply';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Verification ---');

  // 1. Create a dummy user
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      username: 'testuser',
      name: 'Test User',
      role: 'user',
      isApproved: true,
      contact: '010-1234-5678',
      address: 'Test City',
      job: 'Tester',
    },
  });
  console.log('User created/found:', user.id);

  // 2. Create a dummy post
  const post = await prisma.post.create({
    data: {
      title: 'Test Volunteer Event',
      authorId: user.id,
      content: 'This is a test event.',
      maxParticipants: 5,
      isRecruiting: true,
    },
  });
  console.log('Post created:', post.id);

  // 3. Apply for the post
  try {
    console.log('Applying for post...');
    await applyForPost(post.id, user.id);
    console.log('Application function executed.');
  } catch (e) {
    console.error('Error calling applyForPost:', e);
  }

  // 4. Verify application
  const app = await prisma.application.findUnique({
    where: {
      postId_userId: {
        postId: post.id,
        userId: user.id,
      },
    },
  });

  if (app) {
    console.log('SUCCESS: Application found in DB:', app);
  } else {
    console.error('FAILURE: Application not found in DB.');
  }

  // Cleanup
  console.log('Cleaning up...');
  await prisma.application.deleteMany({ where: { postId: post.id } });
  await prisma.post.delete({ where: { id: post.id } });
  // Keep user for future tests or delete if you want strictly clean slate
  // await prisma.user.delete({ where: { id: user.id } });

  console.log('--- Verification Complete ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
