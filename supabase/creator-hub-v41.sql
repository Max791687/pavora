-- PAVORA v41: creator metrics, moderation RBAC and growth.
-- Admin membership is provisioned server-side only; never from user metadata.
create table if not exists public.pv_app_admins (
 user_id uuid primary key references auth.users(id) on delete cascade,
 granted_at timestamptz not null default now()
);
alter table public.pv_app_admins enable row level security;
revoke all on public.pv_app_admins from anon,authenticated;
grant select on public.pv_app_admins to authenticated;
drop policy if exists "Admin membership read own" on public.pv_app_admins;
create policy "Admin membership read own" on public.pv_app_admins
 for select to authenticated using (user_id=(select auth.uid()));

-- Seed only the existing verified official brand owner, not a guessed user.
insert into public.pv_app_admins(user_id)
select u.id from auth.users u
join public.profiles p on p.id=u.id
where p.is_official=true and lower(p.username)='pavora'
  and u.email_confirmed_at is not null
on conflict(user_id) do nothing;

-- The report queue is readable/updateable only by provisioned admins.
grant select,update on public.content_reports to authenticated;
drop policy if exists "Admins review reports" on public.content_reports;
create policy "Admins review reports" on public.content_reports for select
 to authenticated using (
 exists (select 1 from public.pv_app_admins a where a.user_id=(select auth.uid()))
);
drop policy if exists "Admins update report status" on public.content_reports;
create policy "Admins update report status" on public.content_reports for update
 to authenticated using (
 exists (select 1 from public.pv_app_admins a where a.user_id=(select auth.uid()))
) with check (
 exists (select 1 from public.pv_app_admins a where a.user_id=(select auth.uid()))
);
-- No client may change report payload fields, only the review status.
revoke update on public.content_reports from authenticated;
grant update(status) on public.content_reports to authenticated;
-- Restrict statuses without overwriting existing unreviewed rows.
alter table public.content_reports drop constraint if exists pv_reports_review_status;
alter table public.content_reports add constraint pv_reports_review_status
 check(status in ('pending','reviewing','resolved','dismissed','open','reviewed') or status is null);

-- Secure aggregate-only creator analytics. Never expose individual watch signals.
create or replace function public.pv_creator_reel_stats(p_reel uuid)
returns table(unique_views bigint,total_likes bigint,total_saves bigint,
 average_watch_seconds numeric,completion_rate numeric)
language plpgsql security definer set search_path='' as $$
begin
 if (select auth.uid()) is null or not exists (
  select 1 from public.reels r where r.id=p_reel and r.author_id=(select auth.uid())
 ) then raise exception 'Not allowed' using errcode='42501'; end if;
 return query select
  (select count(*) from public.reel_views v where v.reel_id=p_reel),
  (select count(*) from public.reel_likes l where l.reel_id=p_reel),
  (select count(*) from public.saved_media s where s.reel_id=p_reel),
  coalesce((select round(avg(w.watch_seconds),1) from public.pv_reel_watch_signals w where w.reel_id=p_reel),0),
  coalesce((select round(100.0*count(*) filter(where w.completed)/nullif(count(*),0),1)
    from public.pv_reel_watch_signals w where w.reel_id=p_reel),0);
end;
$$;
revoke execute on function public.pv_creator_reel_stats(uuid) from public,anon;
grant execute on function public.pv_creator_reel_stats(uuid) to authenticated;

-- Hardening: these are trigger/event-trigger routines, not public API routes.
revoke execute on function public.pv_guard_official_profile() from public,anon,authenticated;
revoke execute on function public.rls_auto_enable() from public,anon,authenticated;
