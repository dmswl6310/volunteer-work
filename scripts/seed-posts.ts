
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create a dummy user if not exists
  let { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'admin@example.com')
    .maybeSingle();

  if (!user) {
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        email: 'admin@example.com',
        username: 'admin',
        role: 'admin',
        is_approved: true,
        contact: '010-0000-0000',
        address: '서울시',
        job: '관리자',
      })
      .select()
      .single();
    if (error) throw error;
    user = newUser;
    console.log('Created dummy user:', user!.id);
  }

  const urgentPosts = [
    {
      title: '🚨 [긴급] 수해 가구 복구 지원 봉사자 모집',
      content: '이번 폭우로 침수된 가구의 가재도구 정리를 도와주실 분들을 찾습니다.',
      category: '재난구호',
      is_urgent: true,
      max_participants: 20,
      current_participants: 5,
      image_url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=1000',
    },
    {
      title: '🩸 긴급 헌혈 캠페인 봉사',
      content: '혈액 수급이 어렵습니다. 헌혈 캠페인을 도와주실 봉사자를 모집합니다.',
      category: '의료/보건',
      is_urgent: true,
      max_participants: 10,
      current_participants: 2,
      image_url: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&q=80&w=1000',
    },
  ];

  for (const post of urgentPosts) {
    await supabase.from('posts').insert({
      ...post,
      author_id: user!.id,
      views: Math.floor(Math.random() * 100),
      scraps: Math.floor(Math.random() * 20),
    });
  }
  console.log(`Created ${urgentPosts.length} urgent posts.`);

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
    await supabase.from('posts').insert({
      title: `${randomTitle} ${i + 1}`,
      content: '함께 봉사활동 하실 분들을 모집합니다. 많은 참여 부탁드립니다.',
      category: randomCategory,
      is_urgent: false,
      max_participants: 10,
      current_participants: Math.floor(Math.random() * 8),
      author_id: user!.id,
      views: Math.floor(Math.random() * 300),
      scraps: Math.floor(Math.random() * 50),
      image_url: `https://source.unsplash.com/random/800x600?volunteer,${i}`,
    });
  }
  console.log('Created 10 regular posts.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
