-- PAVORA v47 Owner Dashboard (already applied through Supabase migration).
-- Non-destructive: no user/content deletion. Only the trusted Edge Function can mutate these tables.
create table if not exists public.pv_content_moderation (
  kind text not null check (kind in ('post','reel')),
  content_id uuid not null,
  hidden boolean not null default true,
  reason text not null default '',
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id),
  primary key(kind,content_id)
);
alter table public.pv_content_moderation enable row level security;
revoke all on public.pv_content_moderation from anon,authenticated;
grant select on public.pv_content_moderation to authenticated;
drop policy if exists "Admins inspect content moderation" on public.pv_content_moderation;
create policy "Admins inspect content moderation" on public.pv_content_moderation for select to authenticated
 using (exists(select 1 from public.pv_app_admins a where a.user_id=(select auth.uid())));
create table if not exists public.pv_admin_audit (
  id bigint generated always as identity primary key,
  actor_id uuid not null references auth.users(id),
  action text not null,
  target_kind text not null,
  target_id text not null,
  reason text not null default '',
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists pv_admin_audit_recent on public.pv_admin_audit(created_at desc);
alter table public.pv_admin_audit enable row level security;
revoke all on public.pv_admin_audit from anon,authenticated;
grant select on public.pv_admin_audit to authenticated;
drop policy if exists "Admins view audit entries" on public.pv_admin_audit;
create policy "Admins view audit entries" on public.pv_admin_audit for select to authenticated
 using (exists(select 1 from public.pv_app_admins a where a.user_id=(select auth.uid())));
-- RLS restrictive policies are ANDed with existing private-account access policies.
-- The SECURITY DEFINER helper ensures RLS filters can see the moderation flag,
-- even though only admins may SELECT the moderation table directly.
create or replace function public.pv_is_content_hidden(p_kind text,p_id uuid)
returns boolean language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.pv_content_moderation m
    where m.kind=p_kind and m.content_id=p_id and m.hidden=true)
$$;
revoke execute on function public.pv_is_content_hidden(text,uuid) from public,anon;
grant execute on function public.pv_is_content_hidden(text,uuid) to authenticated;
drop policy if exists "PAVORA moderated posts hidden" on public.posts;
create policy "PAVORA moderated posts hidden" on public.posts as restrictive for select to authenticated using (
  not public.pv_is_content_hidden('post',id)
  or exists(select 1 from public.pv_app_admins a where a.user_id=(select auth.uid()))
);
drop policy if exists "PAVORA moderated reels hidden" on public.reels;
create policy "PAVORA moderated reels hidden" on public.reels as restrictive for select to authenticated using (
  not public.pv_is_content_hidden('reel',id)
  or exists(select 1 from public.pv_app_admins a where a.user_id=(select auth.uid()))
);
