-- Run only in an isolated PostgreSQL test database with fix-signup-auth-sync.sql applied.
-- All test accounts are rolled back. No Supabase API calls or emails are sent.
begin;
do $$
declare
  account_id uuid := gen_random_uuid();
  malformed_id uuid := gen_random_uuid();
  existing_id uuid := gen_random_uuid();
begin
  if has_function_privilege('anon', 'public.handle_new_user()', 'execute')
    or has_function_privilege('authenticated', 'public.handle_new_user()', 'execute') then
    raise exception 'Signup trigger function is executable by API roles';
  end if;

  insert into auth.users (id, email, raw_user_meta_data)
  values (account_id, account_id::text || '@example.invalid',
    '{"username":"signup-security-test","role":"admin","is_approved":true,"points":999999}'::jsonb);
  if not exists (select 1 from public.users where id = account_id::text
    and role = 'user' and is_approved = false and points = 0
    and username = 'signup-security-test') then
    raise exception 'Signup trusted caller-supplied privileges';
  end if;

  insert into auth.users (id, email, raw_user_meta_data)
  values (malformed_id, malformed_id::text || '@example.invalid',
    '{"role":"admin","is_approved":"invalid","points":"invalid"}'::jsonb);
  if not exists (select 1 from public.users where id = malformed_id::text
    and role = 'user' and is_approved = false and points = 0) then
    raise exception 'Malformed metadata changed signup defaults';
  end if;

  insert into public.users (id, email, username, role, is_approved, points)
  values (existing_id::text, existing_id::text || '@example.invalid', 'existing', 'admin', true, 25);
  insert into auth.users (id, email, raw_user_meta_data)
  values (existing_id, existing_id::text || '@example.invalid',
    '{"role":"user","is_approved":false,"points":999999}'::jsonb);
  if not exists (select 1 from public.users where id = existing_id::text
    and role = 'admin' and is_approved = true and points = 25) then
    raise exception 'Signup overwrote existing privileges or points';
  end if;
end;
$$;
rollback;
