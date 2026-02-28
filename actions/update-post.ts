'use server';

import { createServerSupabaseClient } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { validateNoProfanity } from '@/lib/profanity';

export async function updatePost(postId: string, formData: FormData) {
  const supabase = await createServerSupabaseClient();

  // 작성자 본인 확인
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다.');

  const { data: post } = await supabase
    .from('posts')
    .select('author_id')
    .eq('id', postId)
    .single();

  if (!post || post.author_id !== user.id) {
    throw new Error('수정 권한이 없습니다.');
  }

  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const category = formData.get('category') as string;
  const maxParticipants = parseInt(formData.get('maxParticipants') as string);
  const isUrgent = formData.get('isUrgent') === 'true';
  const isRecruiting = formData.get('isRecruiting') !== 'false';
  const dueDateStr = formData.get('dueDate') as string;
  const imageUrl = formData.get('imageUrl') as string;

  if (!title || !content || !category) throw new Error('필수 항목을 입력해주세요.');

  // 욕설 필터링
  const profanityError = validateNoProfanity(
    { label: '제목', value: title },
    { label: '내용', value: content }
  );
  if (profanityError) throw new Error(profanityError);

  const dueDate = dueDateStr ? new Date(dueDateStr).toISOString() : null;

  const { error } = await supabase
    .from('posts')
    .update({
      title,
      content,
      category,
      max_participants: maxParticipants,
      is_urgent: isUrgent,
      is_recruiting: isRecruiting,
      due_date: dueDate,
      ...(imageUrl ? { image_url: imageUrl } : {}),
    })
    .eq('id', postId);

  if (error) {
    console.error(error);
    throw new Error('게시글 수정 실패');
  }

  revalidatePath(`/board/${postId}`);
  redirect(`/board/${postId}`);
}
