-- PAVORA per-user hidden conversations (run in existing project's SQL Editor).
-- Hiding a chat affects only your inbox, not the other participant's messages.
create table if not exists public.hidden_conversations (
 owner_id uuid not null references public.profiles(id) on delete cascade,
 peer_id uuid not null references public.profiles(id) on delete cascade,
 hidden_at timestamptz not null default now(),
 primary key(owner_id,peer_id),
 constraint hidden_chat_not_self check(owner_id <> peer_id)
);
alter table public.hidden_conversations enable row level security;
drop policy if exists "Read own hidden conversations" on public.hidden_conversations;
create policy "Read own hidden conversations" on public.hidden_conversations for select to authenticated using (owner_id=auth.uid());
drop policy if exists "Hide own conversations" on public.hidden_conversations;
create policy "Hide own conversations" on public.hidden_conversations for insert to authenticated with check (owner_id=auth.uid());
drop policy if exists "Update own hidden conversations" on public.hidden_conversations;
create policy "Update own hidden conversations" on public.hidden_conversations for update to authenticated using (owner_id=auth.uid()) with check(owner_id=auth.uid());
drop policy if exists "Unhide own conversations" on public.hidden_conversations;
create policy "Unhide own conversations" on public.hidden_conversations for delete to authenticated using (owner_id=auth.uid());
grant select,insert,update,delete on public.hidden_conversations to authenticated;
