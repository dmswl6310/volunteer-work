
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('Starting cleanup...');

    // 1. Find non-admin users
    const { data: usersToDelete } = await supabase
        .from('users')
        .select('id')
        .neq('role', 'admin');

    const userIds = (usersToDelete ?? []).map((u) => u.id);
    console.log(`Found ${userIds.length} non-admin users to delete.`);

    if (userIds.length === 0) {
        console.log('No users to delete.');
        return;
    }

    // 2. Find reviews and posts authored by these users
    const { data: reviews } = await supabase
        .from('reviews')
        .select('id')
        .in('author_id', userIds);
    const reviewIds = (reviews ?? []).map((r) => r.id);

    const { data: posts } = await supabase
        .from('posts')
        .select('id')
        .in('author_id', userIds);
    const postIds = (posts ?? []).map((p) => p.id);

    // 3. Delete all dependencies
    console.log('Deleting dependent data...');

    if (reviewIds.length > 0) {
        await supabase.from('review_likes').delete().in('review_id', reviewIds);
    }
    await supabase.from('review_likes').delete().in('user_id', userIds);
    await supabase.from('post_scraps').delete().in('user_id', userIds);
    await supabase.from('applications').delete().in('user_id', userIds);
    await supabase.from('reviews').delete().in('author_id', userIds);

    if (postIds.length > 0) {
        await supabase.from('applications').delete().in('post_id', postIds);
        await supabase.from('post_scraps').delete().in('post_id', postIds);
        await supabase.from('reviews').delete().in('post_id', postIds);
    }

    // 4. Delete posts and users
    console.log('Deleting content and users...');
    if (postIds.length > 0) {
        await supabase.from('posts').delete().in('id', postIds);
    }
    await supabase.from('users').delete().in('id', userIds);

    console.log('Cleanup completed successfully.');
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
