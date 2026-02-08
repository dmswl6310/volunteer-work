'use server';

import prisma from '@/lib/prisma';

export type CreateUserParams = {
  id: string; // Supabase Auth ID
  email: string;
  password?: string; // Not stored in DB, handled by Supabase
  username: string; // Nickname
  name: string; // Real Name (or mapped from Nickname if UI simplifies)
  contact: string;
  address: string;
  job: string;
};

export async function createUserRecord(data: CreateUserParams) {
  try {
    // Check for duplicate nickname (username in DB schema)
    const existingUser = await prisma.user.findUnique({
      where: { username: data.username },
    });

    if (existingUser) {
      return { success: false, error: '이미 사용 중인 닉네임입니다.' };
    }

    // Check for duplicate email just in case
    const existingEmail = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingEmail) {
        // If auth created but DB failed previously, this might happen.
        // But usually we want to fail.
       return { success: false, error: '이미 가입된 이메일입니다.' };
    }

    await prisma.user.create({
      data: {
        id: data.id,
        email: data.email,
        username: data.username, // Using nickname as username column
        name: data.name, 
        contact: data.contact,
        address: data.address,
        job: data.job,
        role: 'user',
        isApproved: false, // Default to pending
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error creating user record:', error);
    return { success: false, error: '계정 정보 저장 중 오류가 발생했습니다.' };
  }
}
