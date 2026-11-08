-- PAVORA Social Suite: run once in Supabase SQL Editor. Safe to rerun.
-- Likes, comments, saved content, 24-hour stories, and WebRTC call signaling.
create table if not exists public.reel_likes (
 user_id uuid not null references public.profiles(id) on delete cascade,
 reel_id uuid not null references public.reels(id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key(user_id,reel_id)
);
create table if not exists public.reel_comments (
 id uuid primary key default gen_random_uuid(),
 reel_id uuid not null references public.reels(id) on delete cascade,
 user_id uuid not null references public.profiles(id) on delete cascade,
 body text not null check(length(trim(body)) between 1 and 500),
 created_at timestamptz not null default now()
);
create table if not exists public.reel_views (
 user_id uuid not null references public.profiles(id) on delete cascade,
 reel_id uuid not null references public.reels(id) on delete cascade,
 last_viewed_at timestamptz not null default now(),
 primary key(user_id,reel_id)
);
create table if not exists public.saved_media (
 user_id uuid not null references public.profiles(id) on delete cascade,
 post_id uuid references public.posts(id) on delete cascade,
 reel_id uuid references public.reels(id) on delete cascade,
 created_at timestamptz not null default now(),
 constraint one_saved_media check((post_id is not null) <> (reel_id is not null)),
 unique(user_id,post_id),
 unique(user_id,reel_id)
);
create table if not exists public.stories (
 id uuid primary key default gen_random_uuid(),
 author_id uuid not null references public.profiles(id) on delete cascade,
 media_path text not null,
 media_type text not null check(media_type in ('image','video')),
 caption text not null default '' check(length(caption)<=500),
 created_at timestamptz not null default now(),
 expires_at timestamptz not null default (now() + interval '24 hours')
);
create table if not exists public.story_views (
 story_id uuid not null references public.stories(id) on delete cascade,
 viewer_id uuid not null references public.profiles(id) on delete cascade,
 viewed_at timestamptz not null default now(),
 primary key(story_id,viewer_id)
);
create table if not exists public.call_signals (
 id uuid primary key default gen_random_uuid(),
 caller_id uuid not null references public.profiles(id) on delete cascade,
 callee_id uuid not null references public.profiles(id) on delete cascade,
 kind text not null check(kind in ('audio','video')),
 status text not null default 'ringing' check(status in ('ringing','accepted','ended','declined')),
 offer_sdp text,
 answer_sdp text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check(caller_id<>callee_id)
);
create index if not exists pv_calls_callee_active on public.call_signals(callee_id,status,created_at desc);
create index if not exists pv_stories_expiry on public.stories(expires_at);
create index if not exists pv_saved_owner on public.saved_media(user_id,created_at desc);
do $$ declare tab text; begin
 foreach tab in array array['reel_likes','reel_comments','reel_views','saved_media','stories','story_views','call_signals'] loop
 execute format('alter table public.%I enable row level security',tab);
 end loop;
end $$;
drop policy if exists "Reel likes public" on public.reel_likes;
create policy "Reel likes public" on public.reel_likes for select to authenticated using (true);
drop policy if exists "Own reel likes insert" on public.reel_likes;
create policy "Own reel likes insert" on public.reel_likes for insert to authenticated with check(auth.uid()=user_id);
drop policy if exists "Own reel likes delete" on public.reel_likes;
create policy "Own reel likes delete" on public.reel_likes for delete to authenticated using(auth.uid()=user_id);
drop policy if exists "Reel comments public" on public.reel_comments;
create policy "Reel comments public" on public.reel_comments for select to authenticated using(true);
drop policy if exists "Own reel comments" on public.reel_comments;
create policy "Own reel comments" on public.reel_comments for insert to authenticated with check(auth.uid()=user_id);
drop policy if exists "Remove own reel comments" on public.reel_comments;
create policy "Remove own reel comments" on public.reel_comments for delete to authenticated using(auth.uid()=user_id);
drop policy if exists "Read reel views" on public.reel_views;
create policy "Read reel views" on public.reel_views for select to authenticated using(true);
drop policy if exists "Record own reel view" on public.reel_views;
create policy "Record own reel view" on public.reel_views for insert to authenticated with check(auth.uid()=user_id);
drop policy if exists "Update own reel view" on public.reel_views;
create policy "Update own reel view" on public.reel_views for update to authenticated using(auth.uid()=user_id) with check(auth.uid()=user_id);
drop policy if exists "Read own saves" on public.saved_media;
create policy "Read own saves" on public.saved_media for select to authenticated using(auth.uid()=user_id);
drop policy if exists "Create own saves" on public.saved_media;
create policy "Create own saves" on public.saved_media for insert to authenticated with check(auth.uid()=user_id);
drop policy if exists "Remove own saves" on public.saved_media;
create policy "Remove own saves" on public.saved_media for delete to authenticated using(auth.uid()=user_id);
drop policy if exists "Read active stories" on public.stories;
create policy "Read active stories" on public.stories for select to authenticated using(expires_at>now() or auth.uid()=author_id);
drop policy if exists "Create own stories" on public.stories;
create policy "Create own stories" on public.stories for insert to authenticated with check(auth.uid()=author_id and expires_at>now() and expires_at<=now()+interval '25 hours');
drop policy if exists "Delete own stories" on public.stories;
create policy "Delete own stories" on public.stories for delete to authenticated using(auth.uid()=author_id);
drop policy if exists "Read story viewers" on public.story_views;
create policy "Read story viewers" on public.story_views for select to authenticated using(viewer_id=auth.uid() or exists(select 1 from public.stories where id=story_id and author_id=auth.uid()));
drop policy if exists "Record own story view" on public.story_views;
create policy "Record own story view" on public.story_views for insert to authenticated with check(viewer_id=auth.uid() and exists(select 1 from public.stories where id=story_id and expires_at>now()));
drop policy if exists "Read own call signals" on public.call_signals;
create policy "Read own call signals" on public.call_signals for select to authenticated using(auth.uid()=caller_id or auth.uid()=callee_id);
drop policy if exists "Initiate calls" on public.call_signals;
create policy "Initiate calls" on public.call_signals for insert to authenticated with check(auth.uid()=caller_id);
drop policy if exists "Participants update calls" on public.call_signals;
create policy "Participants update calls" on public.call_signals for update to authenticated using(auth.uid()=caller_id or auth.uid()=callee_id) with check(auth.uid()=caller_id or auth.uid()=callee_id);
grant select,insert,delete on public.reel_likes,public.reel_comments,public.saved_media,public.stories to authenticated;
grant select,insert,update on public.reel_views to authenticated;
grant select,insert on public.story_views to authenticated;
grant select,insert,update on public.call_signals to authenticated;
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('story-media','story-media',true,52428800,array['image/jpeg','image/png','image/webp','video/mp4','video/webm'])
on conflict (id) do nothing;
drop policy if exists "Stories public media" on storage.objects;
create policy "Stories public media" on storage.objects for select using(bucket_id='story-media');
drop policy if exists "Stories own media upload" on storage.objects;
create policy "Stories own media upload" on storage.objects for insert to authenticated
with check(bucket_id='story-media' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists "Stories own media delete" on storage.objects;
create policy "Stories own media delete" on storage.objects for delete to authenticated
using(bucket_id='story-media' and (storage.foldername(name))[1]=auth.uid()::text);

-- Protect call participant identities and negotiated SDP from tampering.
create or replace function public.pv_protect_call_identity() returns trigger
language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if new.id <> old.id or new.caller_id <> old.caller_id or new.callee_id <> old.callee_id
    or new.kind <> old.kind or new.created_at <> old.created_at then
   raise exception 'Call identity is immutable';
 end if;
 if auth.uid()=old.caller_id then
   if new.answer_sdp is distinct from old.answer_sdp then
     raise exception 'Only receiver can answer a call';
   end if;
 elsif auth.uid()=old.callee_id then
   if new.offer_sdp is distinct from old.offer_sdp then
     raise exception 'Only caller can change offer';
   end if;
 else
   raise exception 'Only call participants may update';
 end if;
 return new;
end $$;
drop trigger if exists pv_call_identity_guard on public.call_signals;
create trigger pv_call_identity_guard before update on public.call_signals
for each row execute function public.pv_protect_call_identity();
revoke all on function public.pv_protect_call_identity() from public;
