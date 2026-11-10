-- PAVORA v57 ephemeral chat-window activity (not message contents).
create table if not exists public.pv_chat_presence (
 user_id uuid primary key references auth.users(id) on delete cascade,
 peer_id uuid not null references auth.users(id) on delete cascade,
 updated_at timestamptz not null default now(),
 constraint pv_chat_presence_no_self check(user_id <> peer_id)
);
create index if not exists pv_chat_presence_recent on public.pv_chat_presence(updated_at desc);
alter table public.pv_chat_presence enable row level security;
revoke all on public.pv_chat_presence from anon,authenticated;
grant select,insert,update,delete on public.pv_chat_presence to authenticated;
grant select on public.pv_chat_presence to service_role;
drop policy if exists "Own active chat status read" on public.pv_chat_presence;
create policy "Own active chat status read" on public.pv_chat_presence for select to authenticated using(user_id=(select auth.uid()));
drop policy if exists "Own active chat status insert" on public.pv_chat_presence;
create policy "Own active chat status insert" on public.pv_chat_presence for insert to authenticated with check(user_id=(select auth.uid()));
drop policy if exists "Own active chat status update" on public.pv_chat_presence;
create policy "Own active chat status update" on public.pv_chat_presence for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
drop policy if exists "Own active chat status delete" on public.pv_chat_presence;
create policy "Own active chat status delete" on public.pv_chat_presence for delete to authenticated using(user_id=(select auth.uid()));
