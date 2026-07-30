-- 공개 조회 변경 전후에 사용하는 읽기 전용 점검 쿼리입니다.
-- 사용자 데이터는 조회하지 않고 테이블 타입, RLS 활성화 여부, 정책, 함수 권한만 확인합니다.

select
  table_schema,
  table_name,
  column_name,
  data_type
from information_schema.columns
where table_schema = 'public'
  and (
    (table_name = 'users' and column_name in ('id'))
    or (table_name = 'posts' and column_name in ('id', 'author_id'))
    or (table_name = 'applications' and column_name in ('post_id', 'user_id', 'status'))
    or (table_name = 'reviews' and column_name in ('id', 'author_id'))
    or (table_name = 'review_likes' and column_name in ('review_id'))
  )
order by table_name, ordinal_position;

select
  namespace.nspname as schema_name,
  class.relname as table_name,
  class.relrowsecurity as rls_enabled,
  class.relforcerowsecurity as force_rls_enabled
from pg_catalog.pg_class as class
join pg_catalog.pg_namespace as namespace on namespace.oid = class.relnamespace
where namespace.nspname = 'public'
  and class.relname in ('users', 'posts', 'applications', 'reviews', 'review_likes', 'post_scraps')
order by class.relname;

select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_catalog.pg_policies
where schemaname = 'public'
  and tablename in ('users', 'posts', 'applications', 'reviews', 'review_likes', 'post_scraps')
order by tablename, policyname;

select
  routine_schema,
  routine_name,
  data_type,
  security_type
from information_schema.routines
where routine_schema = 'public'
  and routine_name in (
    'confirm_attendance_and_award_points',
    'get_public_profiles',
    'get_public_review_like_counts',
    'is_approved_admin',
    'can_read_private_user_profile',
    'get_organizer_contact',
    'approve_user'
  )
order by routine_name;

select
  has_table_privilege('authenticated', 'public.users', 'INSERT') as authenticated_users_insert,
  has_column_privilege('authenticated', 'public.users', 'contact', 'UPDATE') as authenticated_contact_update,
  has_column_privilege('authenticated', 'public.users', 'address', 'UPDATE') as authenticated_address_update,
  has_column_privilege('authenticated', 'public.users', 'job', 'UPDATE') as authenticated_job_update,
  has_column_privilege('authenticated', 'public.users', 'email', 'UPDATE') as authenticated_email_update,
  has_column_privilege('authenticated', 'public.users', 'role', 'UPDATE') as authenticated_role_update,
  has_column_privilege('authenticated', 'public.users', 'is_approved', 'UPDATE') as authenticated_approval_update;
