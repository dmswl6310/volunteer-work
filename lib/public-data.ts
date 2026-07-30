import type { SupabaseClient } from '@supabase/supabase-js';

type PublicProfileRow = {
  id: string;
  username: string | null;
};

type ReviewLikeCountRow = {
  review_id: string;
  like_count: number | string | null;
};

export async function getPublicProfileMap(supabase: SupabaseClient, ids: Array<string | null | undefined>) {
  const profileIds = [...new Set(ids.filter((id): id is string => Boolean(id)))];
  if (profileIds.length === 0) return new Map<string, PublicProfileRow>();

  const { data, error } = await supabase.rpc('get_public_profiles', { profile_ids: profileIds });
  if (error) {
    console.error('Error fetching public profiles:', error.message);
    return new Map<string, PublicProfileRow>();
  }

  return new Map(((data ?? []) as PublicProfileRow[]).map((profile) => [profile.id, profile]));
}

export async function getPublicReviewLikeCountMap(supabase: SupabaseClient, ids: string[]) {
  const reviewIds = [...new Set(ids)];
  if (reviewIds.length === 0) return new Map<string, number>();

  const { data, error } = await supabase.rpc('get_public_review_like_counts', { review_ids: reviewIds });
  if (error) {
    console.error('Error fetching public review like counts:', error.message);
    return new Map<string, number>();
  }

  return new Map(
    ((data ?? []) as ReviewLikeCountRow[]).map((row) => [row.review_id, Number(row.like_count ?? 0)])
  );
}
