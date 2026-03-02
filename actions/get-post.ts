'use server';

import { createServerSupabaseClient } from '@/lib/supabase';

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
      .select(`
        *,
        author:users(name, email, contact, username),
        reviews(count)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}
