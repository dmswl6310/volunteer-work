'use server';

import { createServerSupabaseClient } from '@/lib/supabase';

export type PostWithAuthor = {
  id: string;
  title: string;
  content: string | null;
  image_url: string | null;
  category: string | null;
  max_participants: number;
  current_participants: number;
  is_urgent: boolean;
  is_recruiting: boolean;
  due_date: string | null;
  views: number;
  scraps: number;
  created_at: string;
  author_id: string;
  author: {
    name: string;
    email: string;
    username: string;
  } | null;
};

/**
 * 게시글 목록을 페이지네이션, 정렬, 필터링 조건에 따라 조회합니다.
 * 무한 스크롤 및 검색/카테고리 필터를 지원합니다.
 *
 * @param page - 페이지 번호 (기본: 1)
 * @param limit - 페이지당 게시글 수 (기본: 10)
 * @param sort - 정렬 방식 ('latest' | 'deadline')
 * @param category - 카테고리 필터
 * @param status - 모집 상태 필터 ('recruiting' | 'closed' | 'all')
 * @param q - 검색어
 * @returns 게시글 배열과 다음 페이지 ID
 */
export async function getPosts({
  page = 1,
  limit = 10,
  sort = 'latest',
  category,
  status = 'recruiting',
  q,
}: {
  page?: number;
  limit?: number;
  sort?: 'latest' | 'deadline';
  category?: string;
  status?: 'recruiting' | 'closed' | 'all';
  q?: string;
}) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const now = new Date().toISOString();

  try {
    const supabase = await createServerSupabaseClient();
    let query = supabase
      .from('posts')
      .select('*, author:users(name, email, username)')
      .range(from, to);

    if (category) {
      query = query.ilike('category', `%${category}%`);
    }

    if (q) {
      query = query.or(`title.ilike.%${q}%,content.ilike.%${q}%`);
    }

    if (status === 'recruiting') {
      // 상시 모집(due_date가 null)이거나 마감일이 지나지 않은 모집중 게시글
      query = query.eq('is_recruiting', true).or(`due_date.is.null,due_date.gte.${now}`);
    } else if (status === 'closed') {
      query = query.or(`is_recruiting.eq.false,due_date.lt.${now}`);
    }

    if (sort === 'deadline') {
      query = query.order('due_date', { ascending: true }).order('created_at', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data: posts, error } = await query;
    if (error) throw error;

    return {
      posts: (posts ?? []) as PostWithAuthor[],
      nextId: (posts?.length ?? 0) === limit ? page + 1 : null,
    };
  } catch (error) {
    console.error('Error fetching posts:', error);
    return { posts: [], nextId: null };
  }
}

/**
 * 긴급 봉사활동 게시글을 조회합니다. (최대 10건)
 * @returns 긴급 게시글 배열
 */
export async function getUrgentPosts() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('posts')
      .select('*, author:users(name, username)')
      .eq('is_urgent', true)
      .eq('is_recruiting', true)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    return data ?? [];
  } catch (error) {
    console.error('Error fetching urgent posts:', error);
    return [];
  }
}
