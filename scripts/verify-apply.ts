import { createClient } from '@supabase/supabase-js';
import { applyForPost } from '../actions/apply';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('--- Starting Verification ---');

  // 1. Upsert dummy user
  const { data: user, error: userError } = await supabase
    .from('users')
    .upsert({
      email: 'test@example.com',
      username: 'testuser',
      name: 'Test User',
      role: 'user',
      is_approved: true,
      contact: '010-1234-5678',
      address: 'Test City',
      job: 'Tester',
    }, { onConflict: 'email' })
    .select()
    .single();

  if (userError) throw userError;
  console.log('User created/found:', user.id);

  // 2. Create a dummy post
  const { data: post, error: postError } = await supabase
    .from('posts')
    .insert({
      title: 'Test Volunteer Event',
      author_id: user.id,
      content: 'This is a test event.',
      max_participants: 5,
      is_recruiting: true,
    })
    .select()
    .single();

  if (postError) throw postError;
  console.log('Post created:', post.id);

  // 3. Apply for the post
  try {
    console.log('Applying for post...');
    await applyForPost(post.id, user.id);
    console.log('Application function executed.');
  } catch (e) {
    console.error('Error calling applyForPost:', e);
  }

  // 4. Verify application
  const { data: app } = await supabase
    .from('applications')
    .select('*')
    .eq('post_id', post.id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (app) {
    console.log('SUCCESS: Application found in DB:', app);
  } else {
    console.error('FAILURE: Application not found in DB.');
  }

  // Cleanup
  console.log('Cleaning up...');
  await supabase.from('applications').delete().eq('post_id', post.id);
  await supabase.from('posts').delete().eq('id', post.id);

  console.log('--- Verification Complete ---');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
