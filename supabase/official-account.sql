-- PAVORA official account identity (run in Supabase SQL Editor).
-- This does NOT create an Auth login. Sign up normally with the owner email,
-- verify the email, and run this migration to protect @pavora.
alter table public.profiles add column if not exists is_official boolean not null default false;

create or replace function public.pv_guard_official_profile()
returns trigger language plpgsql security definer
set search_path = public, auth, pg_temp as $$
declare owner_verified boolean := false;
begin
 select exists (
   select 1 from auth.users u
   where u.id = new.id
     and lower(u.email) = 'max791687@gmail.com'
     and u.email_confirmed_at is not null
 ) into owner_verified;

 if lower(new.username) = 'pavora' and not owner_verified then
   raise exception 'The @pavora username is reserved for the verified official account';
 end if;
 if tg_op = 'UPDATE' and old.is_official and not owner_verified then
   raise exception 'Official account identity cannot be transferred';
 end if;
 -- Only an email-confirmed, matching Auth user can receive the badge.
 new.is_official := owner_verified and lower(new.username) = 'pavora';
 return new;
end;
$$;

drop trigger if exists pv_official_profile_guard on public.profiles;
create trigger pv_official_profile_guard
before insert or update on public.profiles
for each row execute function public.pv_guard_official_profile();

-- Backfill and correct any legacy client-written "is_official" values.
update public.profiles p
set is_official = exists (
  select 1 from auth.users u
  where u.id = p.id
    and lower(u.email) = 'max791687@gmail.com'
    and u.email_confirmed_at is not null
    and lower(p.username) = 'pavora'
);

-- One account may already own this handle. Check before creating a new signup:
-- select id, username from public.profiles where lower(username) = 'pavora';
-- If another user already has it, resolve ownership in the Supabase dashboard
-- before attempting to claim the username. Do not delete users blindly.
