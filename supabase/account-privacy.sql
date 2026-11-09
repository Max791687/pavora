-- PAVORA Account Privacy v1 — Run once in Supabase SQL Editor.
-- Existing profiles remain PUBLIC; no existing followers or content are deleted.
-- Important: existing public media buckets/URLs require a separate signed-media migration
-- for full cryptographic privacy. App screens and database content SELECT are protected here.
begin;
alter table public.profiles add column if not exists is_private boolean not null default false;
create table if not exists public.follow_requests(
 follower_id uuid not null references public.profiles(id) on delete cascade,
 following_id uuid not null references public.profiles(id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key(follower_id,following_id),
 constraint pv_follow_request_not_self check(follower_id<>following_id)
);
create index if not exists pv_follow_requests_recipient on public.follow_requests(following_id,created_at desc);
alter table public.follow_requests enable row level security;
grant select,insert,delete on public.follow_requests to authenticated;
drop policy if exists "Participants read follow requests" on public.follow_requests;
create policy "Participants read follow requests" on public.follow_requests for select to authenticated
 using(auth.uid()=follower_id or auth.uid()=following_id);
drop policy if exists "Request private follow" on public.follow_requests;
create policy "Request private follow" on public.follow_requests for insert to authenticated
 with check(auth.uid()=follower_id and exists(
 select 1 from public.profiles p where p.id=following_id and p.is_private
 ) and not exists(select 1 from public.follows f where f.follower_id=auth.uid() and f.following_id=following_id));
drop policy if exists "Participants can remove request" on public.follow_requests;
create policy "Participants can remove request" on public.follow_requests for delete to authenticated
 using(auth.uid()=follower_id or auth.uid()=following_id);

-- A SECURITY DEFINER function avoids recursive follows/posts RLS checks.
create or replace function public.pv_can_view_profile_content(target_id uuid)
returns boolean language sql stable security definer
set search_path=public,pg_temp as $$
 select coalesce(
   auth.uid()=target_id
   or not (select p.is_private from public.profiles p where p.id=target_id)
   or exists(select 1 from public.follows f
      where f.follower_id=auth.uid() and f.following_id=target_id), false);
$$;
revoke all on function public.pv_can_view_profile_content(uuid) from public;
grant execute on function public.pv_can_view_profile_content(uuid) to authenticated;

-- Protect content at query level, not merely in UI.
drop policy if exists "Posts readable" on public.posts;
drop policy if exists "Posts private access" on public.posts;
create policy "Posts private access" on public.posts for select to authenticated
 using(public.pv_can_view_profile_content(author_id));
drop policy if exists "Reels readable" on public.reels;
drop policy if exists "Reels private access" on public.reels;
create policy "Reels private access" on public.reels for select to authenticated
 using(public.pv_can_view_profile_content(author_id));
drop policy if exists "Read active stories" on public.stories;
create policy "Read active stories" on public.stories for select to authenticated
 using((expires_at>now() or auth.uid()=author_id) and public.pv_can_view_profile_content(author_id));

-- Old follow insertion policy must not allow bypassing requests for private profiles.
drop policy if exists "Own follows insert" on public.follows;
drop policy if exists "Own follows public only" on public.follows;
create policy "Own follows public only" on public.follows for insert to authenticated
 with check(auth.uid()=follower_id and exists(select 1 from public.profiles p where p.id=following_id and not p.is_private));

-- Accept request via a transactionally validated server function.
create or replace function public.pv_accept_follow_request(requester uuid)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if auth.uid() is null or not exists(
   select 1 from public.follow_requests r
   where r.following_id=auth.uid() and r.follower_id=requester
 ) then raise exception 'Follow request not found or unauthorized'; end if;
 insert into public.follows(follower_id,following_id) values(requester,auth.uid())
 on conflict do nothing;
 delete from public.follow_requests where follower_id=requester and following_id=auth.uid();
end;
$$;
revoke all on function public.pv_accept_follow_request(uuid) from public;
grant execute on function public.pv_accept_follow_request(uuid) to authenticated;

-- Profile update policy already requires auth.uid()=id; user can change own is_private.
commit;
