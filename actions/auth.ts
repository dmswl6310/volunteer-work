'use server';

import { createClient, type User } from '@supabase/supabase-js';
import { checkProfanity } from '@/lib/profanity';

type UsersRow = {
  id: string;
  email: string;
  username: string;
  contact: string;
  address: string;
  job: string;
  role: 'user' | 'admin';
  is_approved: boolean;
};

type PublicUserLookup = Pick<UsersRow, 'id' | 'is_approved'>;

export type CreateUserParams = {
  id: string;
  email: string;
  username: string;
  contact: string;
  address: string;
  job: string;
};

export type RegisterUserParams = {
  email: string;
  password: string;
  username: string;
  contact: string;
  address: string;
  job: string;
};

type AvailabilityStatus = {
  exists: boolean;
  message: string;
};

type AvailabilityResult = {
  ok: boolean;
  email: AvailabilityStatus;
  nickname: AvailabilityStatus;
};

type RegisterUserResult = {
  success: boolean;
  error?: string;
  fieldErrors?: {
    email?: string;
    username?: string;
  };
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabaseAdmin() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for signup operations.');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeNickname(nickname: string) {
  return nickname.trim();
}

function validateEmailFormat(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateNickname(nickname: string) {
  if (nickname.length < 2 || nickname.length > 10) {
    return '닉네임은 2자 이상 10자 이하여야 합니다.';
  }

  if (!/^[가-힣a-zA-Z0-9]+$/.test(nickname)) {
    return '닉네임에는 특수문자나 기호를 사용할 수 없습니다.';
  }

  if (checkProfanity(nickname)) {
    return '사용할 수 없는 단어가 포함되어 있습니다.';
  }

  return null;
}

async function findPublicUserByEmail(email: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, is_approved')
    .eq('email', email)
    .maybeSingle<PublicUserLookup>();

  if (error) {
    throw error;
  }

  return data;
}

async function findPublicUserByNickname(nickname: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('username', nickname)
    .maybeSingle<Pick<UsersRow, 'id'>>();

  if (error) {
    throw error;
  }

  return data;
}

async function findAuthUserByEmail(email: string) {
  const supabaseAdmin = getSupabaseAdmin();
  let page = 1;
  const perPage = 200;

  while (page <= 100) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });

    if (error) {
      throw error;
    }

    const matchedUser = data.users.find((user) => normalizeEmail(user.email ?? '') === email);
    if (matchedUser) {
      return matchedUser;
    }

    if (data.users.length < perPage) {
      break;
    }

    page += 1;
  }

  return null;
}

function getEmailConflictMessage(publicUser: PublicUserLookup | null, authUser: User | null) {
  if (publicUser && !publicUser.is_approved) {
    return '관리자 승인 대기 중인 이메일입니다.';
  }

  if (publicUser || authUser) {
    return '이미 가입된 이메일입니다.';
  }

  return '사용 가능한 이메일입니다.';
}

async function createPendingUserRecord(data: CreateUserParams) {
  const supabaseAdmin = getSupabaseAdmin();

  const { error } = await supabaseAdmin.from('users').insert({
    id: data.id,
    email: normalizeEmail(data.email),
    username: normalizeNickname(data.username),
    contact: data.contact,
    address: data.address,
    job: data.job,
    role: 'user',
    is_approved: false,
  });

  if (error) {
    throw error;
  }
}

async function deleteAuthUser(userId: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (error) {
    console.error('Error deleting auth user during signup rollback:', error);
  }
}

async function checkSignupAvailability(input: { email: string; username: string }): Promise<AvailabilityResult> {
  const normalizedEmail = normalizeEmail(input.email);
  const normalizedNickname = normalizeNickname(input.username);

  const [publicUserByEmail, authUserByEmail, publicUserByNickname] = await Promise.all([
    findPublicUserByEmail(normalizedEmail),
    findAuthUserByEmail(normalizedEmail),
    findPublicUserByNickname(normalizedNickname),
  ]);

  const emailMessage = getEmailConflictMessage(publicUserByEmail, authUserByEmail);
  const nicknameExists = Boolean(publicUserByNickname);

  return {
    ok: emailMessage === '사용 가능한 이메일입니다.' && !nicknameExists,
    email: {
      exists: emailMessage !== '사용 가능한 이메일입니다.',
      message: emailMessage,
    },
    nickname: nicknameExists
      ? { exists: true, message: '이미 사용 중인 닉네임입니다.' }
      : { exists: false, message: '사용 가능한 닉네임입니다.' },
  };
}

export async function createUserRecord(data: CreateUserParams) {
  try {
    const normalizedEmail = normalizeEmail(data.email);
    const normalizedNickname = normalizeNickname(data.username);
    const nicknameError = validateNickname(normalizedNickname);

    if (!validateEmailFormat(normalizedEmail)) {
      return { success: false, error: '올바른 이메일 형식이 아닙니다.' };
    }

    if (nicknameError) {
      return { success: false, error: nicknameError };
    }

    const availability = await checkSignupAvailability({
      email: normalizedEmail,
      username: normalizedNickname,
    });

    if (availability.email.exists) {
      return { success: false, error: availability.email.message };
    }

    if (availability.nickname.exists) {
      return { success: false, error: availability.nickname.message };
    }

    await createPendingUserRecord({
      ...data,
      email: normalizedEmail,
      username: normalizedNickname,
    });

    return { success: true };
  } catch (error: unknown) {
    console.error('Error creating user record:', error);
    return { success: false, error: '계정 정보 저장 중 오류가 발생했습니다.' };
  }
}

export async function checkEmailExists(email: string): Promise<AvailabilityStatus> {
  try {
    const normalizedEmail = normalizeEmail(email);

    if (!validateEmailFormat(normalizedEmail)) {
      return { exists: true, message: '올바른 이메일 형식이 아닙니다.' };
    }

    const publicUser = await findPublicUserByEmail(normalizedEmail);
    const authUser = await findAuthUserByEmail(normalizedEmail);

    return {
      exists: Boolean(publicUser || authUser),
      message: getEmailConflictMessage(publicUser, authUser),
    };
  } catch (error) {
    console.error('Error checking email:', error);
    return { exists: true, message: '회원가입 설정을 확인해주세요. 잠시 후 다시 시도해주세요.' };
  }
}

export async function checkNicknameExists(nickname: string): Promise<AvailabilityStatus> {
  try {
    const normalizedNickname = normalizeNickname(nickname);
    const nicknameError = validateNickname(normalizedNickname);

    if (nicknameError) {
      return { exists: true, message: nicknameError };
    }

    const existingUser = await findPublicUserByNickname(normalizedNickname);

    if (existingUser) {
      return { exists: true, message: '이미 사용 중인 닉네임입니다.' };
    }

    return { exists: false, message: '사용 가능한 닉네임입니다.' };
  } catch (error) {
    console.error('Error checking nickname:', error);
    return { exists: true, message: '회원가입 설정을 확인해주세요. 잠시 후 다시 시도해주세요.' };
  }
}

export async function registerUser(input: RegisterUserParams): Promise<RegisterUserResult> {
  let createdAuthUserId: string | null = null;

  try {
    const normalizedEmail = normalizeEmail(input.email);
    const normalizedNickname = normalizeNickname(input.username);
    const trimmedAddress = input.address.trim();
    const trimmedJob = input.job.trim();

    if (!validateEmailFormat(normalizedEmail)) {
      return {
        success: false,
        error: '입력한 이메일을 다시 확인해 주세요.',
        fieldErrors: { email: '올바른 이메일 형식이 아닙니다.' },
      };
    }

    const nicknameError = validateNickname(normalizedNickname);
    if (nicknameError) {
      return {
        success: false,
        error: '입력한 닉네임을 다시 확인해 주세요.',
        fieldErrors: { username: nicknameError },
      };
    }

    if (!trimmedAddress || !trimmedJob) {
      return {
        success: false,
        error: '추가 정보를 모두 입력해 주세요.',
      };
    }

    const availability = await checkSignupAvailability({
      email: normalizedEmail,
      username: normalizedNickname,
    });

    if (!availability.ok) {
      return {
        success: false,
        error: availability.email.exists ? availability.email.message : availability.nickname.message,
        fieldErrors: {
          email: availability.email.exists ? availability.email.message : undefined,
          username: availability.nickname.exists ? availability.nickname.message : undefined,
        },
      };
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password: input.password,
      email_confirm: true,
      user_metadata: {
        username: normalizedNickname,
      },
    });

    if (error || !data.user) {
      return {
        success: false,
        error: '회원가입 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      };
    }

    createdAuthUserId = data.user.id;

    await createPendingUserRecord({
      id: data.user.id,
      email: normalizedEmail,
      username: normalizedNickname,
      contact: input.contact,
      address: trimmedAddress,
      job: trimmedJob,
    });

    return { success: true };
  } catch (error: unknown) {
    console.error('Error registering user:', error);

    if (createdAuthUserId) {
      await deleteAuthUser(createdAuthUserId);
    }

    return {
      success: false,
      error: '회원가입 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
    };
  }
}
