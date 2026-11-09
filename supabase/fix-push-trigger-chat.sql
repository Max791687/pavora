-- PAVORA HOTFIX: Run this SQL once in Supabase SQL Editor.
-- Fixes error: record "new" has no field "reel_id" when sending DMs.
-- Safe to run again. No need to drop data, triggers or re-create webhooks.

create or replace function public.pv_queue_push() returns trigger
language plpgsql security definer set search_path=public,pg_temp as $$
declare destination uuid;
declare actor uuid;
declare kind text;
declare source uuid;
begin
 -- Read only fields belonging to the actual trigger table.
 -- Dynamic NEW.reel_id inside a CASE can still fail when NEW is a DM row.
 if tg_table_name='direct_messages' then
  destination:=new.recipient_id;actor:=new.sender_id;kind:='message';source:=new.id;
 elsif tg_table_name='activity_notifications' then
  destination:=new.recipient_id;actor:=new.actor_id;kind:=new.kind;source:=new.id;
 elsif tg_table_name='reel_likes' then
  select author_id into destination from public.reels where id=new.reel_id;
  actor:=new.user_id;kind:='reel_like';source:=new.reel_id;
 elsif tg_table_name='reel_comments' then
  select author_id into destination from public.reels where id=new.reel_id;
  actor:=new.user_id;kind:='reel_comment';source:=new.id;
 elsif tg_table_name='story_views' then
  select author_id into destination from public.stories where id=new.story_id;
  actor:=new.viewer_id;kind:='story_view';source:=new.story_id;
 else
  return new;
 end if;
 if destination is not null and actor is not null and source is not null and destination<>actor then
  insert into public.push_jobs(recipient_id,actor_id,event_kind,source_id)
  values(destination,actor,kind,source)
  on conflict do nothing;
 end if;
 return new;
exception when others then
 -- Notification failures must never prevent posting, liking, viewing stories or sending DMs.
 raise warning 'PAVORA push queue skipped for %: %',tg_table_name,sqlerrm;
 return new;
end $$;
