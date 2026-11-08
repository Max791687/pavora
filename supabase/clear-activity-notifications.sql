-- Run once in PAVORA Supabase SQL Editor to enable Clear all activity notifications.
-- RLS ensures members can only clear notifications addressed to themselves.
drop policy if exists "Owner clears activity notifications" on public.activity_notifications;
create policy "Owner clears activity notifications" on public.activity_notifications
for delete to authenticated using (recipient_id = auth.uid());
grant delete on public.activity_notifications to authenticated;
