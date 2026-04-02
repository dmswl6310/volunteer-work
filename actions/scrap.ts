'use server';

import { revalidatePath } from 'next/cache';
import { requireApprovedUser } from '@/lib/server-auth';

async function syncScrapCount(supabase: Awaited<ReturnType<typeof requireApprovedUser>>['supabase'], postId: string) {
  const { count, error: countError } = await supabase
    .from('post_scraps')
    .select('id', { count: 'exact', head: true })
    .eq('post_id', postId);

  if (countError) {
    throw new Error(countError.message || '스크랩 수를 다시 계산하지 못했습니다.');
  }

  const { error: updateError } = await supabase
    .from('posts')
    .update({ scraps: count ?? 0 })
    .eq('id', postId);

  if (updateError) {
    throw new Error(updateError.message || '스크랩 수 동기화 중 오류가 발생했습니다.');
  }
}

/**
 * 게시글 스크랩을 토글합니다. (스크랩/스크랩 취소)
 * post_scraps 테이블과 posts.scraps 카운터를 동시에 업데이트합니다.
 *
 * @param postId - 스크랩할 게시글 ID
 */
export async function toggleScrap(postId: string) {
  try {
    const { supabase, user } = await requireApprovedUser();

    const { data: existingScrap } = await supabase
      .from('post_scraps')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingScrap) {
      const { error: deleteError } = await supabase.from('post_scraps').delete().eq('id', existingScrap.id);
      if (deleteError) throw deleteError;
    } else {
      const { error: insertError } = await supabase.from('post_scraps').insert({ id: crypto.randomUUID(), post_id: postId, user_id: user.id });
      if (insertError) throw insertError;
    }

    await syncScrapCount(supabase, postId);

    revalidatePath(`/board/${postId}`);
    revalidatePath('/board');
  } catch (error) {
    console.error('Error toggling scrap:', error);
    throw new Error('스크랩 처리 중 오류가 발생했습니다.');
  }
}
