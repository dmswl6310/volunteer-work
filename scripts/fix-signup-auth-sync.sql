-- 회원가입(createUser / signUp) 시 `Database error creating/saving new user`가 발생할 때 적용
-- 목적:
-- 1) public.users 기본값/nullable 제약을 auth 생성 흐름에 맞춤
-- 2) auth.users 생성 시 public.users를 안전하게 upsert 하는 트리거 재구성

begin;

alter table public.users
  alter column role set default 'user',
  alter column is_approved set default false,
  alter column points set default 0;

alter table public.users
  alter column contact drop not null,
  alter column address drop not null,
  alter column job drop not null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (
    id,
    email,
    username,
    contact,
    address,
    job,
    role,
    is_approved,
    points
  )
  values (
    new.id::text,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(coalesce(new.email, ''), '@', 1)),
    nullif(new.raw_user_meta_data ->> 'contact', ''),
    nullif(new.raw_user_meta_data ->> 'address', ''),
    nullif(new.raw_user_meta_data ->> 'job', ''),
    -- 권한 값은 가입자가 제어하는 메타데이터를 신뢰하지 않습니다.
    'user',
    false,
    0
  )
  on conflict (id) do update
  set
    email = excluded.email,
    username = excluded.username,
    contact = coalesce(excluded.contact, public.users.contact),
    address = coalesce(excluded.address, public.users.address),
    job = coalesce(excluded.job, public.users.job);

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

commit;
