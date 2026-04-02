create table if not exists public.support_tickets (
  id text primary key,
  user_id text not null,
  category text not null,
  title text not null,
  content text not null,
  status text not null default 'pending',
  username_snapshot text,
  email_snapshot text,
  admin_note text,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  constraint support_tickets_category_check check (category in ('inquiry', 'bug', 'feedback')),
  constraint support_tickets_status_check check (status in ('pending', 'in_progress', 'resolved'))
);

create index if not exists support_tickets_user_created_idx
  on public.support_tickets (user_id, created_at desc);

create index if not exists support_tickets_status_created_idx
  on public.support_tickets (status, created_at desc);

grant usage on schema public to authenticated, service_role;
grant select, insert, update on public.support_tickets to authenticated;
grant all privileges on public.support_tickets to service_role;

alter table public.support_tickets enable row level security;

drop policy if exists "support_tickets_select_own" on public.support_tickets;
create policy "support_tickets_select_own" on public.support_tickets
  for select to authenticated
  using (auth.uid()::text = user_id);

drop policy if exists "support_tickets_insert_own" on public.support_tickets;
create policy "support_tickets_insert_own" on public.support_tickets
  for insert to authenticated
  with check (auth.uid()::text = user_id);

drop policy if exists "support_tickets_select_admin" on public.support_tickets;
create policy "support_tickets_select_admin" on public.support_tickets
  for select to authenticated
  using (
    exists (
      select 1 from public.users
      where users.id::uuid = auth.uid() and users.role = 'admin'
    )
  );

drop policy if exists "support_tickets_update_admin" on public.support_tickets;
create policy "support_tickets_update_admin" on public.support_tickets
  for update to authenticated
  using (
    exists (
      select 1 from public.users
      where users.id::uuid = auth.uid() and users.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.users
      where users.id::uuid = auth.uid() and users.role = 'admin'
    )
  );
