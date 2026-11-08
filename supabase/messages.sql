-- PAVORA private one-to-one messages. Run once in Supabase SQL Editor.
create table if not exists public.direct_messages (
 id uuid primary key default gen_random_uuid(),
 sender_id uuid not null references public.profiles(id) on delete cascade,
 recipient_id uuid not null references public.profiles(id) on delete cascade,
 body text not null check (char_length(trim(body)) between 1 and 2000),
 created_at timestamptz not null default now(),
 check(sender_id <> recipient_id)
);
create index if not exists direct_messages_sender_time on public.direct_messages(sender_id,created_at desc);
create index if not exists direct_messages_recipient_time on public.direct_messages(recipient_id,created_at desc);
alter table public.direct_messages enable row level security;
grant select,insert,delete on public.direct_messages to authenticated;
create policy "Participants read own messages" on public.direct_messages
for select to authenticated using (auth.uid()=sender_id or auth.uid()=recipient_id);
create policy "Sender sends own messages" on public.direct_messages
for insert to authenticated with check (auth.uid()=sender_id);
create policy "Sender deletes own messages" on public.direct_messages
for delete to authenticated using (auth.uid()=sender_id);
-- No anon grants. RLS prevents reading conversations that don't involve the signed-in user.
