-- 게시글 상세에서 작성자 연락처를 표시하려면,
-- 인증된 사용자가 users 테이블의 작성자 정보를 조회할 수 있어야 합니다.
-- 현재 정책이 더 좁게 바뀌어 있었다면 아래 SQL을 다시 적용하세요.

alter table public.users enable row level security;

drop policy if exists "users_select" on public.users;

create policy "users_select" on public.users
  for select to authenticated
  using (true);
