-- PAVORA v50: optional self-managed non-secret password reminder.
create table if not exists public.pv_password_hints (
 user_id uuid primary key references auth.users(id) on delete cascade,
 hint text not null check (char_length(hint) between 4 and 120),
 updated_at timestamptz not null default now()
);
alter table public.pv_password_hints enable row level security;
revoke all on public.pv_password_hints from anon,authenticated;
grant select,insert,update,delete on public.pv_password_hints to authenticated;
drop policy if exists "Own password hint read" on public.pv_password_hints;
create policy "Own password hint read" on public.pv_password_hints for select to authenticated using (user_id=(select auth.uid()));
drop policy if exists "Own password hint insert" on public.pv_password_hints;
create policy "Own password hint insert" on public.pv_password_hints for insert to authenticated with check (user_id=(select auth.uid()));
drop policy if exists "Own password hint update" on public.pv_password_hints;
create policy "Own password hint update" on public.pv_password_hints for update to authenticated using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));
drop policy if exists "Own password hint delete" on public.pv_password_hints;
create policy "Own password hint delete" on public.pv_password_hints for delete to authenticated using (user_id=(select auth.uid()));
