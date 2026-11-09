create table if not exists public.pv_reel_preferences (
 user_id uuid not null references auth.users(id) on delete cascade,
 reel_id uuid not null references public.reels(id) on delete cascade,
 not_interested boolean not null default true,
 updated_at timestamptz not null default now(),
 primary key (user_id,reel_id)
);
alter table public.pv_reel_preferences enable row level security;
revoke all on public.pv_reel_preferences from anon;
grant select,insert,update,delete on public.pv_reel_preferences to authenticated;
drop policy if exists "Reel preferences own read" on public.pv_reel_preferences;
create policy "Reel preferences own read" on public.pv_reel_preferences for select to authenticated using ((select auth.uid())=user_id);
drop policy if exists "Reel preferences own insert" on public.pv_reel_preferences;
create policy "Reel preferences own insert" on public.pv_reel_preferences for insert to authenticated with check ((select auth.uid())=user_id);
drop policy if exists "Reel preferences own update" on public.pv_reel_preferences;
create policy "Reel preferences own update" on public.pv_reel_preferences for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
drop policy if exists "Reel preferences own delete" on public.pv_reel_preferences;
create policy "Reel preferences own delete" on public.pv_reel_preferences for delete to authenticated using ((select auth.uid())=user_id);
