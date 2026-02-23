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
      query = query.eq('is_recruiting', true).gte('due_date', now);
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
