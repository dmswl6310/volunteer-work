'use server';

import { createServerSupabaseClient } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('username', data.username)
      .maybeSingle();

    if (existingUser) {
      return { success: false, error: '이미 사용 중인 닉네임입니다.' };
    }

    // 이메일 중복 및 승인 상태 체크
    const { data: existingEmail } = await supabaseAdmin
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

/**
 * 이메일(아이디) 중복 및 가입대기 상태를 확인합니다.
 */
export async function checkEmailExists(email: string) {
  try {
    const { data: existingEmail } = await supabaseAdmin
      .from('users')
      .select('id, is_approved')
      .eq('email', email)
      .maybeSingle();

    if (existingEmail) {
      if (!existingEmail.is_approved) {
        return { exists: true, message: '관리자 승인 대기 중인 이메일입니다.' };
      }
      return { exists: true, message: '이미 가입된 이메일입니다.' };
    }
    return { exists: false, message: '사용 가능한 이메일입니다.' };
  } catch (error) {
    console.error('Error checking email:', error);
    return { exists: true, message: '중복 확인 중 오류가 발생했습니다.' }; // 안전을 위해 exists true
  }
}

/**
 * 닉네임 중복을 확인합니다.
 */
export async function checkNicknameExists(nickname: string) {
  try {
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('username', nickname)
      .maybeSingle();

    if (existingUser) {
      return { exists: true, message: '이미 사용 중인 닉네임입니다.' };
    }
    return { exists: false, message: '사용 가능한 닉네임입니다.' };
  } catch (error) {
    console.error('Error checking nickname:', error);
    return { exists: true, message: '중복 확인 중 오류가 발생했습니다.' }; 
  }
}
