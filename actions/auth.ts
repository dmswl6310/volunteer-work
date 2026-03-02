'use server';

import { createServerSupabaseClient } from '@/lib/supabase';

export type CreateUserParams = {
  id: string;
  email: string;
  password?: string;
  username: string;
  name: string;
  contact: string;
  address: string;
  job: string;
};

/**
 * 회원가입 시 유저 레코드를 생성합니다.
 * - 닉네임/이메일 중복 검사
 * - 관리자 승인 대기 상태로 생성
 *
 * @param data - 유저 정보 (id, email, username, name, contact, address, job)
 * @returns 성공 시 { success: true }, 실패 시 { success: false, error: string }
 */
export async function createUserRecord(data: CreateUserParams) {
  try {
    const supabase = await createServerSupabaseClient();

    // 닉네임 중복 체크
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', data.username)
      .maybeSingle();

    if (existingUser) {
      return { success: false, error: '이미 사용 중인 닉네임입니다.' };
    }

    // 이메일 중복 및 승인 상태 체크
    const { data: existingEmail } = await supabase
      .from('users')
      .select('id, is_approved')
      .eq('email', data.email)
      .maybeSingle();

    if (existingEmail && existingEmail.id !== data.id) {
      if (!existingEmail.is_approved) {
        return { success: false, error: '현재 관리자 승인 대기 중인 이메일입니다.' };
      }
      return { success: false, error: '이미 존재하는 계정입니다.' };
    }

    const { error } = await supabase.from('users').upsert({
      id: data.id,
      email: data.email,
      username: data.username,
      name: data.name,
      contact: data.contact,
      address: data.address,
      job: data.job,
      role: 'user',
      is_approved: false,
    }, { onConflict: 'id' });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error creating user record:', error);
    return { success: false, error: '계정 정보 저장 중 오류가 발생했습니다.' };
  }
}
