'use server';
import { revalidatePath } from 'next/cache';
import { validateNoProfanity } from '@/lib/profanity';
import { requireApprovedUser } from '@/lib/server-auth';

/**
 * 새로운 봉사활동 게시글을 작성합니다.
 * - 욕설 필터링 적용
 * - 유저 존재 확인 (auto-heal)
 * - Supabase posts 테이블에 삽입
 *
 * @param formData - 게시글 작성 폼 데이터
 * @returns 성공 시 { success: true }, 욕설 감지 시 { error: string }
 */
export async function createPost(formData: FormData) {
  const { supabase, user } = await requireApprovedUser();
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const category = formData.get('category') as string;
  const maxParticipants = parseInt(formData.get('maxParticipants') as string);
  const volunteerHours = parseInt(formData.get('volunteerHours') as string);
  const imageUrl = formData.get('imageUrl') as string;
  const isUrgent = formData.get('isUrgent') === 'true';
  const dueDateStr = formData.get('dueDate') as string;

  if (!title || !content || !category) throw new Error('필수 항목을 입력해주세요.');

  // 욕설 필터링
  const profanityError = validateNoProfanity(
    { label: '제목', value: title },
    { label: '내용', value: content }
  );
  if (profanityError) return { error: profanityError };

  const dueDate = dueDateStr ? `${dueDateStr}T23:59:59.999+09:00` : null;

  const { error } = await supabase.from('posts').insert({
    title,
    content,
    category,
    max_participants: maxParticipants,
    volunteer_hours: Number.isFinite(volunteerHours) ? volunteerHours : 1,
    author_id: user.id,
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
