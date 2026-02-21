'use server';

import { createServerSupabaseClient } from '@/lib/supabase';

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
