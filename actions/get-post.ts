'use server';

import { createServerSupabaseClient } from '@/lib/supabase';
import { getPublicProfileMap } from '@/lib/public-data';
import type { PostWithAuthor } from '@/actions/posts';

const PUBLIC_POST_FIELDS = 'id, title, content, image_url, category, max_participants, volunteer_hours, current_participants, is_urgent, is_recruiting, due_date, views, scraps, created_at, author_id';
type PublicPostRow = Omit<PostWithAuthor, 'author'>;

/**
 * 게시글 상세 정보를 조회합니다. (작성자 정보, 후기 수 포함)
 * @param id - 게시글 ID
 * @returns 게시글 데이터 또는 null
 */
export async function getPost(id: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('posts')
      .select(PUBLIC_POST_FIELDS)
      .eq('id', id)
      .single();

    if (error) throw error;
    const post = data as PublicPostRow;
    const profiles = await getPublicProfileMap(supabase, [post.author_id]);
    return {
      ...post,
      author: profiles.has(post.author_id)
        ? { username: profiles.get(post.author_id)?.username ?? '익명' }
        : null,
    } satisfies PostWithAuthor;
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

export async function getOrganizerContactForViewer(postId: string) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { canView: false, contact: null as string | null };

  const { data, error } = await supabase.rpc('get_organizer_contact', { target_post_id: postId });
  if (error) {
    console.error('Error fetching organizer contact:', error.message);
    return { canView: false, contact: null as string | null };
  }

  const row = (data?.[0] ?? null) as { contact: string | null } | null;
  return {
    canView: Boolean(row),
    contact: row?.contact?.trim() || null,
  };
}
