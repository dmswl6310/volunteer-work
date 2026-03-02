'use server';

import { createServerSupabaseClient } from '@/lib/supabase';
import { ensureUserExists } from '@/lib/auto-heal-user';

/**
 * 마이페이지에 필요한 유저 데이터를 조회합니다.
 * - 프로필 정보
 * - 신청 내역, 스크랩, 작성 게시글, 작성 후기
 * - 유저가 DB에 없으면 자동 생성 (auto-heal)
 *
 * @param userId - 조회할 유저 ID
 * @param email - 유저 이메일 (auto-heal 시 필요)
 * @param name - 유저 이름 (auto-heal 시 사용)
 */
export async function getMyPageData(userId: string, email?: string, name?: string) {
    try {
        const supabase = await createServerSupabaseClient();

        const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

        // 유저가 없으면 자동 생성
        if (!user && email) {
            await ensureUserExists(supabase, userId, email, name);
        }

        if (!user) return null;

        // 관련 데이터 병렬 조회
        const [applicationsRes, scrapsRes, postsRes, reviewsRes] = await Promise.all([
            supabase
                .from('applications')
                .select('*, posts(*)')
                .eq('user_id', userId)
                .order('created_at', { ascending: false }),
            supabase
                .from('post_scraps')
                .select('*, posts(*)')
                .eq('user_id', userId)
                .order('created_at', { ascending: false }),
            supabase
                .from('posts')
                .select('*, applications(*, users(*))')
                .eq('author_id', userId)
                .order('created_at', { ascending: false }),
            supabase
                .from('reviews')
                .select('*, posts(*)')
                .eq('author_id', userId)
                .order('created_at', { ascending: false }),
        ]);

        return {
            ...user,
            applications: applicationsRes.data ?? [],
            postScraps: scrapsRes.data ?? [],
            posts: postsRes.data ?? [],
            reviews: reviewsRes.data ?? [],
        };
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw new Error('Failed to load user data');
    }
}

/**
 * 유저의 관리자 승인 상태를 확인합니다.
 * @param userId - 확인할 유저 ID
 * @returns 승인 여부와 역할 정보
 */
export async function checkUserApproval(userId: string) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: user, error } = await supabase
            .from('users')
            .select('is_approved, role')
            .eq('id', userId)
            .maybeSingle();

        if (error || !user) {
            return { success: false, error: 'User not found' };
        }

        return { success: true, isApproved: user.is_approved, role: user.role };
    } catch (error) {
        console.error('Error checking user approval:', error);
        return { success: false, error: 'Failed to check user status' };
    }
}
