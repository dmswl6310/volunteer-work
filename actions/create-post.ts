'use server';

import { createServerSupabaseClient } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { validateNoProfanity } from '@/lib/profanity';

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const category = formData.get('category') as string;
  const maxParticipants = parseInt(formData.get('maxParticipants') as string);
  const userId = formData.get('userId') as string;
  const imageUrl = formData.get('imageUrl') as string;
  const isUrgent = formData.get('isUrgent') === 'true';
  const dueDateStr = formData.get('dueDate') as string;
  const email = formData.get('email') as string;
  const name = formData.get('name') as string;

  if (!userId) throw new Error('Unauthorized');
  if (!title || !content || !category) throw new Error('필수 항목을 입력해주세요.');

  // 욕설 필터링
  const profanityError = validateNoProfanity(
    { label: '제목', value: title },
    { label: '내용', value: content }
  );
  if (profanityError) return { error: profanityError };

  const dueDate = dueDateStr ? `${dueDateStr}T23:59:59.999+09:00` : null;
  const supabase = await createServerSupabaseClient();

  // 유저 존재 체크 (auto-heal)
  const { data: userExists } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (!userExists) {
    console.warn(`User ${userId} not found in DB. Auto-creating...`);
    if (!email) throw new Error('User email not provided for auto-registration.');

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

  const { error } = await supabase.from('posts').insert({
    title,
    content,
    category,
    max_participants: maxParticipants,
    author_id: userId,
    image_url: imageUrl || null,
    is_recruiting: true,
    is_urgent: isUrgent,
    due_date: dueDate,
  });

  if (error) {
    console.error(error);
    throw new Error('게시글 작성 실패');
  }

  revalidatePath('/board');
  // redirect('/board'); (Server Action 내에서 redirect는 에러를 throw하므로 클라이언트에서 처리하도록 변경)
  return { success: true };
}
