-- PAVORA Background Push v1. Run in Supabase SQL Editor.
-- Private subscriptions are only visible/writable to their owner.
create table if not exists public.push_subscriptions (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.profiles(id) on delete cascade,
 endpoint text not null unique,
 p256dh text not null,
 auth text not null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint push_endpoint_https check(endpoint like 'https://%')
);
create index if not exists push_subscriptions_owner_idx on public.push_subscriptions(user_id);
alter table public.push_subscriptions enable row level security;
revoke all on public.push_subscriptions from anon,authenticated;
grant select,insert,update,delete on public.push_subscriptions to authenticated;
drop policy if exists "Push owner select" on public.push_subscriptions;
create policy "Push owner select" on public.push_subscriptions for select to authenticated using (user_id=auth.uid());
drop policy if exists "Push owner insert" on public.push_subscriptions;
create policy "Push owner insert" on public.push_subscriptions for insert to authenticated with check (user_id=auth.uid());
drop policy if exists "Push owner update" on public.push_subscriptions;
create policy "Push owner update" on public.push_subscriptions for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
drop policy if exists "Push owner delete" on public.push_subscriptions;
create policy "Push owner delete" on public.push_subscriptions for delete to authenticated using(user_id=auth.uid());

-- Queue is server-only. A Database Webhook invokes the Edge Function for each INSERT.
create table if not exists public.push_jobs (
 id uuid primary key default gen_random_uuid(),
 recipient_id uuid not null references public.profiles(id) on delete cascade,
 actor_id uuid references public.profiles(id) on delete set null,
 event_kind text not null check(event_kind in ('message','like','comment','follow','reel_like','reel_comment','story_view')),
 source_id uuid not null,
 created_at timestamptz not null default now(),
 processed_at timestamptz,
 unique(event_kind,source_id,actor_id)
);
create index if not exists push_jobs_pending_idx on public.push_jobs(created_at) where processed_at is null;
alter table public.push_jobs enable row level security;
revoke all on public.push_jobs from anon,authenticated;

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
revoke all on function public.pv_queue_push() from public;
drop trigger if exists pv_push_message on public.direct_messages;
create trigger pv_push_message after insert on public.direct_messages for each row execute function public.pv_queue_push();
drop trigger if exists pv_push_activity on public.activity_notifications;
create trigger pv_push_activity after insert on public.activity_notifications for each row execute function public.pv_queue_push();
drop trigger if exists pv_push_reel_like on public.reel_likes;
create trigger pv_push_reel_like after insert on public.reel_likes for each row execute function public.pv_queue_push();
drop trigger if exists pv_push_reel_comment on public.reel_comments;
create trigger pv_push_reel_comment after insert on public.reel_comments for each row execute function public.pv_queue_push();
drop trigger if exists pv_push_story_view on public.story_views;
create trigger pv_push_story_view after insert on public.story_views for each row execute function public.pv_queue_push();

-- IMPORTANT: Supabase Dashboard > Database > Webhooks:
-- Create webhook "pavora-push" on INSERT into public.push_jobs.
-- URL: https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-push
-- HTTP Header: x-pavora-webhook-secret = YOUR_RANDOM_WEBHOOK_SECRET
-- Set the identical secret in Edge Function secrets.
-- Deploy Edge Function with Verify JWT disabled (webhook authenticates using custom secret).
