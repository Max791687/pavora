-- PAVORA inbox organizer. Run once in your Supabase SQL Editor.
-- Each person's folder, pin and mute settings belong only to their own account.
create table if not exists public.conversation_preferences (
  owner_id uuid not null references auth.users(id) on delete cascade,
  peer_id uuid not null references auth.users(id) on delete cascade,
  folder text not null default 'primary' check (folder in ('primary','general')),
  pinned boolean not null default false,
  muted boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (owner_id,peer_id),
  check (owner_id <> peer_id)
);
alter table public.conversation_preferences enable row level security;
drop policy if exists "View own conversation settings" on public.conversation_preferences;
create policy "View own conversation settings" on public.conversation_preferences
  for select to authenticated using (auth.uid() = owner_id);
drop policy if exists "Insert own conversation settings" on public.conversation_preferences;
create policy "Insert own conversation settings" on public.conversation_preferences
  for insert to authenticated with check (auth.uid() = owner_id);
drop policy if exists "Update own conversation settings" on public.conversation_preferences;
create policy "Update own conversation settings" on public.conversation_preferences
  for update to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
grant select,insert,update on public.conversation_preferences to authenticated;
create index if not exists conversation_preferences_owner_folder_idx on public.conversation_preferences(owner_id,folder);
