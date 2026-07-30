-- 공개 탐색을 허용하되 사용자 개인정보는 관계 기반으로 제한합니다.
-- Supabase SQL Editor에서 한 번 적용해야 애플리케이션의 비회원 조회가 동작합니다.

begin;

alter table public.posts enable row level security;
alter table public.reviews enable row level security;
alter table public.users enable row level security;

-- 원격 스키마의 관련 ID 컬럼은 모두 text 타입입니다.
-- 예상과 다른 스키마에 잘못 적용되는 일을 막기 위해 트랜잭션 초기에 검증합니다.
do $block$
declare
  invalid_column_count integer;
begin
  select count(*)
  into invalid_column_count
  from (
    values
      ('users', 'id'),
      ('posts', 'id'),
      ('posts', 'author_id'),
      ('applications', 'post_id'),
      ('applications', 'user_id'),
      ('reviews', 'id'),
      ('reviews', 'author_id'),
      ('review_likes', 'review_id')
  ) as expected(table_name, column_name)
  left join information_schema.columns as column_info
    on column_info.table_schema = 'public'
   and column_info.table_name = expected.table_name
   and column_info.column_name = expected.column_name
   and column_info.data_type = 'text'
  where column_info.column_name is null;

  if invalid_column_count > 0 then
    raise exception '공개 조회 RLS를 적용할 수 없습니다. 필수 ID 컬럼 또는 text 타입을 확인하세요.';
  end if;
end;
$block$;

drop policy if exists "posts_select_public" on public.posts;
create policy "posts_select_public" on public.posts
  for select to anon, authenticated
  using (true);

drop policy if exists "reviews_select_public" on public.reviews;
create policy "reviews_select_public" on public.reviews
  for select to anon, authenticated
  using (true);

grant select on public.posts, public.reviews to anon, authenticated;

-- 공개 화면은 users 테이블을 직접 열지 않고 이 함수로 닉네임만 조회합니다.
create or replace function public.get_public_profiles(profile_ids text[])
returns table (id text, username text)
language sql
stable
security definer
set search_path = ''
as $function$
  select u.id::text, u.username::text
  from public.users as u
  where u.id = any(coalesce(profile_ids, array[]::text[]));
$function$;

revoke all on function public.get_public_profiles(text[]) from public, anon, authenticated;
grant execute on function public.get_public_profiles(text[]) to anon, authenticated;

-- review_likes 원본 행은 공개하지 않고 후기별 합계만 노출합니다.
create or replace function public.get_public_review_like_counts(review_ids text[])
returns table (review_id text, like_count bigint)
language sql
stable
security definer
set search_path = ''
as $function$
  select rl.review_id::text, count(*)::bigint
  from public.review_likes as rl
  where rl.review_id = any(coalesce(review_ids, array[]::text[]))
  group by rl.review_id;
$function$;

revoke all on function public.get_public_review_like_counts(text[]) from public, anon, authenticated;
grant execute on function public.get_public_review_like_counts(text[]) to anon, authenticated;

create or replace function public.is_approved_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.users as viewer
    where viewer.id = auth.uid()::text
      and viewer.is_approved = true
      and viewer.role = 'admin'
  );
$function$;

revoke all on function public.is_approved_admin() from public, anon, authenticated;
grant execute on function public.is_approved_admin() to authenticated;

-- 본인, 관리자, 자신의 활동에 신청한 사용자 정보만 users 원본 행을 읽을 수 있습니다.
create or replace function public.can_read_private_user_profile(target_user_id text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select
    auth.uid()::text = target_user_id
    or public.is_approved_admin()
    or (
      exists (
        select 1
        from public.users as viewer
        where viewer.id = auth.uid()::text
          and viewer.is_approved = true
      )
      and exists (
        select 1
        from public.applications as application
        join public.posts as post on post.id = application.post_id
        where application.user_id = target_user_id
          and post.author_id = auth.uid()::text
      )
    );
$function$;

revoke all on function public.can_read_private_user_profile(text) from public, anon, authenticated;
grant execute on function public.can_read_private_user_profile(text) to authenticated;

-- 익명 사용자는 users 원본 테이블을 직접 조회할 필요가 없습니다.
revoke select on public.users from anon;
grant select on public.users to authenticated;

-- 알려진 기존의 "인증 사용자 전체 공개" 정책을 제거합니다.
drop policy if exists "users_select" on public.users;
drop policy if exists "users_select_private_authorized" on public.users;

-- 허용 정책과 제한 정책을 함께 둡니다.
-- 이름을 알 수 없는 기존 허용형 SELECT/ALL 정책이 남아 있어도 제한 정책과 AND로 결합되어
-- 본인·관리자·자신의 활동 신청자 외의 개인정보 행을 읽을 수 없습니다.
create policy "users_select_private_authorized" on public.users
  for select to authenticated
  using (public.can_read_private_user_profile(id));

drop policy if exists "users_select_private_restrictive" on public.users;
create policy "users_select_private_restrictive" on public.users
  as restrictive
  for select to authenticated
  using (public.can_read_private_user_profile(id));

-- 주최자 연락처는 승인된 참여자, 주최자 본인, 관리자에게만 반환합니다.
create or replace function public.get_organizer_contact(target_post_id text)
returns table (contact text)
language sql
stable
security definer
set search_path = ''
as $function$
  select organizer.contact::text
  from public.posts as post
  join public.users as organizer on organizer.id = post.author_id
  where post.id = target_post_id
    and exists (
      select 1
      from public.users as viewer
      where viewer.id = auth.uid()::text
        and viewer.is_approved = true
    )
    and (
      post.author_id = auth.uid()::text
      or public.is_approved_admin()
      or exists (
        select 1
        from public.applications as application
        where application.post_id = post.id
          and application.user_id = auth.uid()::text
          and application.status = 'approved'
      )
    );
$function$;

revoke all on function public.get_organizer_contact(text) from public, anon, authenticated;
grant execute on function public.get_organizer_contact(text) to authenticated;

commit;
