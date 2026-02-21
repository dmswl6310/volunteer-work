'use server';

import { createServerSupabaseClient } from '@/lib/supabase';

export async function getMyPageData(userId: string, email?: string, name?: string) {
    try {
        const supabase = await createServerSupabaseClient();

        const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

        // auto-heal
        if (!user && email) {
            console.warn(`User ${userId} missing in MyPage. Auto-healing...`);
            const emailPrefix = email.split('@')[0];
            let newUsername = emailPrefix;
            let counter = 1;
            while (true) {
                const { data: taken } = await supabase
                    .from('users')
                    .select('id')
                    .eq('username', newUsername)
                    .maybeSingle();
                if (!taken) break;
                newUsername = `${emailPrefix}${counter}`;
                counter++;
            }
            await supabase.from('users').insert({
                id: userId,
                email,
                username: newUsername,
                name: name || 'User',
                contact: '010-0000-0000',
                address: 'Unknown',
                job: 'Unknown',
                role: 'user',
                is_approved: true,
            });
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
