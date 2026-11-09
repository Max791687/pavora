-- Watch engagement is private: only the logged-in viewer can read/write their own signals.
create table if not exists public.pv_reel_watch_signals (
 user_id uuid not null references auth.users(id) on delete cascade,
 reel_id uuid not null references public.reels(id) on delete cascade,
 watch_seconds numeric(9,2) not null default 0 check(watch_seconds>=0),
 completed boolean not null default false,
 updated_at timestamptz not null default now(),
 primary key (user_id,reel_id)
);
alter table public.pv_reel_watch_signals enable row level security;
revoke all on public.pv_reel_watch_signals from anon;
grant select,insert,update on public.pv_reel_watch_signals to authenticated;
drop policy if exists "Own reel watch read" on public.pv_reel_watch_signals;
create policy "Own reel watch read" on public.pv_reel_watch_signals for select to authenticated using ((select auth.uid())=user_id);
drop policy if exists "Own reel watch insert" on public.pv_reel_watch_signals;
create policy "Own reel watch insert" on public.pv_reel_watch_signals for insert to authenticated with check ((select auth.uid())=user_id);
drop policy if exists "Own reel watch update" on public.pv_reel_watch_signals;
create policy "Own reel watch update" on public.pv_reel_watch_signals for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
