-- PAVORA unread message counters (run once in existing Supabase project SQL Editor)
alter table public.direct_messages add column if not exists read_at timestamptz;
create index if not exists dm_unread_recipient_idx on public.direct_messages(recipient_id,created_at desc) where read_at is null;
drop policy if exists "Recipient marks messages read" on public.direct_messages;
create policy "Recipient marks messages read" on public.direct_messages for update to authenticated
 using (auth.uid()=recipient_id) with check (auth.uid()=recipient_id);
grant update(read_at) on public.direct_messages to authenticated;
-- Existing select/insert RLS remains in place; client updates only read_at.
