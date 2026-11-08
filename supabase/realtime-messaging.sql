-- PAVORA Advanced Chat: enable low-latency direct message events.
-- Run this file once in Supabase Dashboard -> SQL Editor -> Run.
-- This does not replace or disable existing direct_messages RLS policies.
-- Supabase clients subscribe with authenticated sessions and per-user filters.
alter table public.direct_messages add column if not exists read_at timestamptz;

-- Allow Realtime to publish INSERT/UPDATE events on DMs.
-- Publication membership is idempotent; no error when re-running this script.
do $$
begin
 if not exists (
  select 1 from pg_publication_tables
   where pubname='supabase_realtime'
     and schemaname='public'
     and tablename='direct_messages'
 ) then
  alter publication supabase_realtime add table public.direct_messages;
 end if;
end $$;

-- Recipient-only read marking; retain all existing conversation RLS.
drop policy if exists "Recipient marks messages read" on public.direct_messages;
create policy "Recipient marks messages read"
 on public.direct_messages for update to authenticated
 using (auth.uid()=recipient_id)
 with check (auth.uid()=recipient_id);
grant update(read_at) on public.direct_messages to authenticated;
create index if not exists dm_unread_recipient_idx
 on public.direct_messages(recipient_id,created_at desc) where read_at is null;

-- Testing:
-- 1. Open the app in two signed-in accounts (separate browser sessions).
-- 2. Send a DM from A to B. B should see it without refreshing.
-- 3. Open B's conversation: A's last sent message should show "Seen".
-- If realtime cannot subscribe, existing polling still fetches new messages.
