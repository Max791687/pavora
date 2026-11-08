-- PAVORA social activity notifications: run once in Supabase SQL Editor.
-- Likes, comments and follows are written by trusted database triggers, not by clients.
create table if not exists public.activity_notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('follow','like','comment')),
  post_id uuid references public.posts(id) on delete set null,
  comment_id uuid references public.comments(id) on delete set null,
  body_preview text,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  constraint activity_no_self check (recipient_id <> actor_id)
);
create index if not exists activity_notifications_recipient_time_idx
on public.activity_notifications(recipient_id, created_at desc);
create index if not exists activity_notifications_unread_idx
on public.activity_notifications(recipient_id, created_at desc) where read_at is null;
alter table public.activity_notifications enable row level security;
drop policy if exists "Owner sees activity notifications" on public.activity_notifications;
create policy "Owner sees activity notifications" on public.activity_notifications for select
to authenticated using (recipient_id = auth.uid());
drop policy if exists "Owner marks activity read" on public.activity_notifications;
create policy "Owner marks activity read" on public.activity_notifications for update
to authenticated using (recipient_id = auth.uid()) with check (recipient_id = auth.uid());
revoke all on public.activity_notifications from anon,authenticated;
grant select on public.activity_notifications to authenticated;
grant update (read_at) on public.activity_notifications to authenticated;

create or replace function public.pv_create_social_notification()
returns trigger language plpgsql security definer
set search_path = public, pg_temp as $$
declare destination uuid;
begin
  if TG_TABLE_NAME = 'follows' then
    destination := NEW.following_id;
    if destination <> NEW.follower_id then
      insert into public.activity_notifications(recipient_id,actor_id,kind)
      values(destination,NEW.follower_id,'follow');
    end if;
  elsif TG_TABLE_NAME = 'likes' then
    select author_id into destination from public.posts where id = NEW.post_id;
    if destination is not null and destination <> NEW.user_id then
      insert into public.activity_notifications(recipient_id,actor_id,kind,post_id)
      values(destination,NEW.user_id,'like',NEW.post_id);
    end if;
  elsif TG_TABLE_NAME = 'comments' then
    select author_id into destination from public.posts where id = NEW.post_id;
    if destination is not null and destination <> NEW.user_id then
      insert into public.activity_notifications(recipient_id,actor_id,kind,post_id,comment_id,body_preview)
      values(destination,NEW.user_id,'comment',NEW.post_id,NEW.id,left(NEW.body,140));
    end if;
  end if;
  return NEW;
end $$;
revoke all on function public.pv_create_social_notification() from public;
drop trigger if exists pv_notify_follow on public.follows;
create trigger pv_notify_follow after insert on public.follows
for each row execute function public.pv_create_social_notification();
drop trigger if exists pv_notify_like on public.likes;
create trigger pv_notify_like after insert on public.likes
for each row execute function public.pv_create_social_notification();
drop trigger if exists pv_notify_comment on public.comments;
create trigger pv_notify_comment after insert on public.comments
for each row execute function public.pv_create_social_notification();
-- Notifications start with new activity after this SQL is installed.