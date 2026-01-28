
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create a dummy user if not exists
  let user = await prisma.user.findFirst({
    where: { email: 'admin@example.com' },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        username: 'admin',
        name: '관리자',
        role: 'admin',
        isApproved: true,
        contact: '010-0000-0000',
        address: '서울시',
        job: '관리자',
      },
    });
    console.log('Created dummy user:', user.id);
  }

  // 2. Create Urgent Posts
  const urgentPosts = [
    {
      title: '🚨 [긴급] 수해 가구 복구 지원 봉사자 모집',
      content: '이번 폭우로 침수된 가구의 가재도구 정리를 도와주실 분들을 찾습니다.',
      category: '재난구호',
      isUrgent: true,
      maxParticipants: 20,
      currentParticipants: 5,
      imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=1000',
    },
    {
      title: '🩸 긴급 헌혈 캠페인 봉사',
      content: '혈액 수급이 어렵습니다. 헌혈 캠페인을 도와주실 봉사자를 모집합니다.',
      category: '의료/보건',
      isUrgent: true,
      maxParticipants: 10,
      currentParticipants: 2,
      imageUrl: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&q=80&w=1000',
    },
  ];

  for (const post of urgentPosts) {
    await prisma.post.create({
      data: {
        ...post,
        authorId: user.id,
        views: Math.floor(Math.random() * 100),
        scraps: Math.floor(Math.random() * 20),
      },
    });
  }
  console.log(`Created ${urgentPosts.length} urgent posts.`);

  // 3. Create Regular Posts
  const categories = ['환경보호', '교육멘토링', '노인복지', '동물보호', '문화예술'];
  const titles = [
    '한강공원 쓰레기 줍기 플로깅',
    '저소득층 아동 학습 지도 멘토링',
    '유기견 보호소 산책 봉사',
    '독거노인 반찬 배달 봉사',
    '벽화 그리기 봉사활동',
    '도서관 책 정리 봉사',
    '장애인 활동 보조 봉사',
    '청소년 진로 상담 멘토링',
  ];

  for (let i = 0; i < 10; i++) {
    const randomTitle = titles[Math.floor(Math.random() * titles.length)];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    
    await prisma.post.create({
      data: {
        title: `${randomTitle} ${i + 1}`,
        content: '함께 봉사활동 하실 분들을 모집합니다. 많은 참여 부탁드립니다.',
        category: randomCategory,
        isUrgent: false,
        maxParticipants: 10,
        currentParticipants: Math.floor(Math.random() * 8),
        authorId: user.id,
        views: Math.floor(Math.random() * 300),
        scraps: Math.floor(Math.random() * 50),
        imageUrl: `https://source.unsplash.com/random/800x600?volunteer,${i}`,
      },
    });
  }
  console.log('Created 10 regular posts.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
