-- PAVORA Reels V1. Run once in PAVORA Supabase SQL Editor.
create table if not exists public.reels (
 id uuid primary key default gen_random_uuid(),
 author_id uuid not null references public.profiles(id) on delete cascade,
 caption text not null default '' check (char_length(caption)<=1000),
 video_path text not null,
 created_at timestamptz not null default now()
);
alter table public.reels enable row level security;
grant select on public.reels to anon;
grant select,insert,delete on public.reels to authenticated;
create policy "Reels readable" on public.reels for select using (true);
create policy "Own reels upload" on public.reels for insert to authenticated with check (auth.uid()=author_id);
create policy "Own reels delete" on public.reels for delete to authenticated using (auth.uid()=author_id);
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('reel-videos','reel-videos',true,52428800,array['video/mp4','video/webm'])
on conflict(id) do nothing;
create policy "Reels public playback" on storage.objects for select using(bucket_id='reel-videos');
create policy "Reels own uploads" on storage.objects for insert to authenticated
with check(bucket_id='reel-videos' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "Reels own delete" on storage.objects for delete to authenticated
using(bucket_id='reel-videos' and (storage.foldername(name))[1]=auth.uid()::text);
