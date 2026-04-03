-- 회원가입(createUser / signUp) 시 `Database error creating/saving new user`가 발생할 때 적용
-- 목적:
-- 1) public.users 기본값/nullable 제약을 auth 생성 흐름에 맞춤
-- 2) auth.users 생성 시 public.users를 안전하게 upsert 하는 트리거 재구성

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
set search_path = public
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
    coalesce(new.raw_user_meta_data ->> 'role', 'user'),
    coalesce((new.raw_user_meta_data ->> 'is_approved')::boolean, false),
    coalesce((new.raw_user_meta_data ->> 'points')::integer, 0)
  )
  on conflict (id) do update
  set
    email = excluded.email,
    username = excluded.username,
    contact = coalesce(excluded.contact, public.users.contact),
    address = coalesce(excluded.address, public.users.address),
    job = coalesce(excluded.job, public.users.job),
    role = coalesce(excluded.role, public.users.role),
    is_approved = coalesce(excluded.is_approved, public.users.is_approved),
    points = coalesce(public.users.points, excluded.points, 0);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
