import { SupabaseClient } from '@supabase/supabase-js';

/**
 * 유저가 DB에 존재하지 않을 때 자동으로 기본 유저 레코드를 생성합니다.
 * (auto-heal 패턴)
 *
 * @param supabase - Supabase 클라이언트 인스턴스
 * @param userId - Supabase Auth 유저 ID
 * @param email - 유저 이메일 (필수)
 * @param name - 유저 이름 (선택, 기본값: 'User')
 * @throws email이 제공되지 않으면 에러 발생
 */
export async function ensureUserExists(
  supabase: SupabaseClient,
  userId: string,
  email?: string,
  name?: string
): Promise<void> {
  // 유저 존재 여부 확인
  const { data: userExists } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (userExists) return;

  // 유저가 없으면 자동 생성
  console.warn(`[auto-heal] User ${userId} not found in DB. Auto-creating...`);
  if (!email) {
    throw new Error('유저 레코드가 없고, 자동 생성을 위한 이메일도 제공되지 않았습니다.');
  }

  // 고유한 username 생성 (이메일 접두사 기반)
  const emailPrefix = email.split('@')[0];
  let newUsername = emailPrefix;
  let counter = 1;

  while (true) {
    const { data: taken } = await supabase
      .from('users')
      .select('id')
      .eq('username', newUsername)
      .maybeSingle();
    if (!taken) break;
    newUsername = `${emailPrefix}${counter}`;
    counter++;
  }

  await supabase.from('users').insert({
    id: userId,
    email,
    username: newUsername,
    name: name || 'User',
    contact: '010-0000-0000',
    address: 'Unknown',
    job: 'Unknown',
    role: 'user',
    is_approved: true,
  });
}
