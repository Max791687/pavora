-- PAVORA presence: authenticated owner heartbeat; visibility only for public profiles.
create table if not exists public.pv_user_presence (
 user_id uuid primary key references auth.users(id) on delete cascade,
 last_active_at timestamptz not null default now(),
 is_active boolean not null default false
);
alter table public.pv_user_presence enable row level security;
revoke all on public.pv_user_presence from anon;
grant select,insert,update on public.pv_user_presence to authenticated;
drop policy if exists "Presence public profile read" on public.pv_user_presence;
create policy "Presence public profile read" on public.pv_user_presence
 for select to authenticated using (
  (select auth.uid())=user_id
  or (
   exists(select 1 from public.profiles p where p.id=user_id and p.is_private=false)
   and not exists (
     select 1 from public.account_blocks b
     where (b.blocker_id=user_id and b.blocked_id=(select auth.uid()))
        or (b.blocker_id=(select auth.uid()) and b.blocked_id=user_id)
   )
  )
 );
drop policy if exists "Presence owner insert" on public.pv_user_presence;
create policy "Presence owner insert" on public.pv_user_presence
 for insert to authenticated with check ((select auth.uid())=user_id);
drop policy if exists "Presence owner update" on public.pv_user_presence;
create policy "Presence owner update" on public.pv_user_presence
 for update to authenticated
 using ((select auth.uid())=user_id)
 with check ((select auth.uid())=user_id);
create or replace function public.pv_presence_touch_timestamp()
returns trigger language plpgsql set search_path='' as $$
begin
 new.last_active_at=now();
 return new;
end;
$$;
drop trigger if exists pv_presence_touch_timestamp on public.pv_user_presence;
create trigger pv_presence_touch_timestamp
 before insert or update on public.pv_user_presence
 for each row execute function public.pv_presence_touch_timestamp();
