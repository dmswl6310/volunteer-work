-- point_transactions 조회 권한/RLS 보정
-- 목적:
-- 1) 일반 유저는 본인 포인트 내역만 조회
-- 2) 관리자는 전체 조회 가능
-- 3) service_role/server-side 점검도 가능하도록 테이블 권한 보강

alter table public.point_transactions enable row level security;

grant select on public.point_transactions to authenticated;
grant select on public.point_transactions to service_role;

drop policy if exists "point_transactions_select" on public.point_transactions;
drop policy if exists "point_transactions_admin_all" on public.point_transactions;

create policy "point_transactions_select"
on public.point_transactions
for select
to authenticated
using (
  user_id = auth.uid()::text
  or exists (
    select 1
    from public.users u
    where u.id = auth.uid()::text
      and u.role = 'admin'
      and u.is_approved = true
  )
);

create policy "point_transactions_admin_all"
on public.point_transactions
for all
to authenticated
using (
  exists (
    select 1
    from public.users u
    where u.id = auth.uid()::text
      and u.role = 'admin'
      and u.is_approved = true
  )
)
with check (
  exists (
    select 1
    from public.users u
    where u.id = auth.uid()::text
      and u.role = 'admin'
      and u.is_approved = true
  )
);
