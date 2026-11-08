-- PAVORA private direct messages. Run in Supabase SQL Editor.
create table if not exists public.direct_messages (
 id uuid primary key default gen_random_uuid(),
 sender_id uuid not null references public.profiles(id) on delete cascade,
 recipient_id uuid not null references public.profiles(id) on delete cascade,
 body text not null check (char_length(trim(body)) between 1 and 2000),
 created_at timestamptz not null default now(),
 constraint no_self_messages check (sender_id <> recipient_id)
);
create index if not exists dm_sender_recipient_time on public.direct_messages(sender_id,recipient_id,created_at desc);
create index if not exists dm_recipient_sender_time on public.direct_messages(recipient_id,sender_id,created_at desc);
alter table public.direct_messages enable row level security;
drop policy if exists "Participants read their messages" on public.direct_messages;
create policy "Participants read their messages" on public.direct_messages for select to authenticated
 using (auth.uid()=sender_id or auth.uid()=recipient_id);
drop policy if exists "Sender sends messages" on public.direct_messages;
create policy "Sender sends messages" on public.direct_messages for insert to authenticated
 with check (auth.uid()=sender_id and recipient_id<>auth.uid());
drop policy if exists "Sender deletes their messages" on public.direct_messages;
create policy "Sender deletes their messages" on public.direct_messages for delete to authenticated
 using (auth.uid()=sender_id);
grant usage on schema public to authenticated;
grant select,insert,delete on public.direct_messages to authenticated;
-- Only public-facing profile fields should be selected by client code.
-- Email and phone are held by Supabase Auth, not public.profiles.
