import { createServerSupabaseClient } from '@/lib/supabase';

type UserProfile = {
  id: string;
  role: string | null;
  is_approved: boolean | null;
  email?: string | null;
  username?: string | null;
};

export async function requireAuthenticatedUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('로그인이 필요합니다.');
  }

  return { supabase, user };
}

export async function requireApprovedUser() {
  const { supabase, user } = await requireAuthenticatedUser();
  const { data: profile, error } = await supabase
    .from('users')
    .select('id, role, is_approved, email, username')
    .eq('id', user.id)
    .maybeSingle<UserProfile>();

  if (error || !profile) {
    throw new Error('사용자 정보를 찾을 수 없습니다. 다시 로그인해 주세요.');
  }

  if (!profile.is_approved) {
    throw new Error('관리자 승인 후 이용할 수 있습니다.');
  }

  return { supabase, user, profile };
}

export async function requireAdminUser() {
  const context = await requireApprovedUser();

  if (context.profile.role !== 'admin') {
    throw new Error('관리자 권한이 없습니다.');
  }

  return context;
}
