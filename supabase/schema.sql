-- PAVORA v2 Supabase schema. Run in Supabase SQL Editor.
create extension if not exists pgcrypto;
create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 username text unique not null check (username ~ '^[a-zA-Z0-9_]{3,24}$'),
 display_name text not null default '',
 bio text not null default '',
 avatar_url text,
 created_at timestamptz not null default now()
);
create table if not exists public.posts (
 id uuid primary key default gen_random_uuid(),
 author_id uuid not null references public.profiles(id) on delete cascade,
 caption text not null default '' check (char_length(caption) <= 2200),
 image_path text,
 created_at timestamptz not null default now()
);
create table if not exists public.likes (
 user_id uuid not null references public.profiles(id) on delete cascade,
 post_id uuid not null references public.posts(id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key (user_id,post_id)
);
create table if not exists public.comments (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.profiles(id) on delete cascade,
 post_id uuid not null references public.posts(id) on delete cascade,
 body text not null check (char_length(body) between 1 and 500),
 created_at timestamptz not null default now()
);
create table if not exists public.follows (
 follower_id uuid not null references public.profiles(id) on delete cascade,
 following_id uuid not null references public.profiles(id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key(follower_id,following_id),
 check(follower_id <> following_id)
);
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.follows enable row level security;
create policy "Public profiles readable" on public.profiles for select using (true);
create policy "Own profile insert" on public.profiles for insert to authenticated with check (auth.uid()=id);
create policy "Own profile update" on public.profiles for update to authenticated using (auth.uid()=id) with check (auth.uid()=id);
create policy "Posts readable" on public.posts for select using (true);
create policy "Own posts insert" on public.posts for insert to authenticated with check (auth.uid()=author_id);
create policy "Own posts delete" on public.posts for delete to authenticated using (auth.uid()=author_id);
create policy "Likes readable" on public.likes for select using (true);
create policy "Own likes insert" on public.likes for insert to authenticated with check (auth.uid()=user_id);
create policy "Own likes delete" on public.likes for delete to authenticated using (auth.uid()=user_id);
create policy "Comments readable" on public.comments for select using (true);
create policy "Own comments insert" on public.comments for insert to authenticated with check (auth.uid()=user_id);
create policy "Own comments delete" on public.comments for delete to authenticated using (auth.uid()=user_id);
create policy "Follows readable" on public.follows for select using (true);
create policy "Own follows insert" on public.follows for insert to authenticated with check (auth.uid()=follower_id);
create policy "Own follows delete" on public.follows for delete to authenticated using (auth.uid()=follower_id);
-- Storage bucket: images are public for feed viewing. Restrict uploads to each user's folder.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('post-images','post-images',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
create policy "Public images readable" on storage.objects for select using (bucket_id='post-images');
create policy "Authenticated uploads own folder" on storage.objects for insert to authenticated
with check (bucket_id='post-images' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "Owners delete own images" on storage.objects for delete to authenticated
using (bucket_id='post-images' and (storage.foldername(name))[1]=auth.uid()::text);
