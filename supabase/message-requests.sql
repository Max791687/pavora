-- PAVORA Message Requests: run ONCE in Supabase SQL Editor.
-- Rule: a sender who does NOT follow the recipient gets one introductory DM
-- until the recipient accepts the request. Existing established chats are preserved.
create table if not exists public.message_requests (
 recipient_id uuid not null references auth.users(id) on delete cascade,
 sender_id uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now(),
 accepted_at timestamptz,
 primary key (recipient_id,sender_id),
 constraint pv_request_not_self check (recipient_id<>sender_id)
);
alter table public.message_requests enable row level security;
drop policy if exists "Message request participants read" on public.message_requests;
create policy "Message request participants read" on public.message_requests
for select to authenticated using (auth.uid()=recipient_id or auth.uid()=sender_id);
drop policy if exists "Recipient accepts message request" on public.message_requests;
create policy "Recipient accepts message request" on public.message_requests
for update to authenticated using (auth.uid()=recipient_id) with check (auth.uid()=recipient_id);
grant select,update(accepted_at) on public.message_requests to authenticated;
-- Existing threads with multiple messages remain established chats; one-message
-- threads from non-followers are routed to Requests rather than getting lost.
insert into public.message_requests(recipient_id,sender_id,created_at,accepted_at)
select d.recipient_id,d.sender_id,min(d.created_at),
 case when count(*)>1 or exists (
   select 1 from public.direct_messages previous
   where previous.sender_id=d.recipient_id and previous.recipient_id=d.sender_id
 ) then now() else null end
from public.direct_messages d
where not exists (select 1 from public.follows f
  where f.follower_id=d.sender_id and f.following_id=d.recipient_id)
group by d.recipient_id,d.sender_id
on conflict (recipient_id,sender_id) do nothing;
-- Database-enforced first-message limit even when clients bypass the UI.
create or replace function public.pv_enforce_dm_requests()
returns trigger language plpgsql security definer
set search_path = public, pg_temp as $$
declare previous_count integer;
begin
 if auth.uid() is null or new.sender_id<>auth.uid() then
   raise exception 'Not authorized to send this message';
 end if;
 -- Serialize concurrent messages from this particular sender to this recipient.
 perform pg_advisory_xact_lock(hashtextextended(new.sender_id::text||':'||new.recipient_id::text,0));
 if exists(select 1 from public.follows f
           where f.follower_id=new.sender_id and f.following_id=new.recipient_id)
    or exists(select 1 from public.message_requests mr
              where mr.recipient_id=new.recipient_id and mr.sender_id=new.sender_id
              and mr.accepted_at is not null)
 then return new; end if;
 select count(*) into previous_count
 from public.direct_messages d
 where d.sender_id=new.sender_id and d.recipient_id=new.recipient_id;
 if previous_count>=1 then
   raise exception 'Message request pending. Wait until the recipient accepts, or follow this account.';
 end if;
 insert into public.message_requests(recipient_id,sender_id)
 values(new.recipient_id,new.sender_id)
 on conflict (recipient_id,sender_id) do nothing;
 return new;
end $$;
drop trigger if exists pv_dm_requests_guard on public.direct_messages;
create trigger pv_dm_requests_guard before insert on public.direct_messages
for each row execute function public.pv_enforce_dm_requests();
-- Sender cannot accept requests on behalf of a recipient.
revoke all on function public.pv_enforce_dm_requests() from public;
