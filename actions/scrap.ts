'use server';

import { createServerSupabaseClient } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function toggleScrap(postId: string, userId: string) {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: existingScrap } = await supabase
      .from('post_scraps')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingScrap) {
      // 스크랩 취소
      await supabase.from('post_scraps').delete().eq('id', existingScrap.id);
      // 현재 scraps 값 읽어서 -1
      const { data: post } = await supabase.from('posts').select('scraps').eq('id', postId).single();
      await supabase.from('posts').update({ scraps: Math.max(0, (post?.scraps ?? 1) - 1) }).eq('id', postId);
    } else {
      // 스크랩
      await supabase.from('post_scraps').insert({ post_id: postId, user_id: userId });
      // 현재 scraps 값 읽어서 +1
      const { data: post } = await supabase.from('posts').select('scraps').eq('id', postId).single();
      await supabase.from('posts').update({ scraps: (post?.scraps ?? 0) + 1 }).eq('id', postId);
    }

    revalidatePath(`/board/${postId}`);
    revalidatePath('/board');
  } catch (error) {
    console.error('Error toggling scrap:', error);
    throw new Error('스크랩 처리 중 오류가 발생했습니다.');
  }
}
