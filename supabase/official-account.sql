-- PAVORA Official: bind the existing @PAVORA account to its verified Auth user.
-- The separately registered max791687@gmail.com account remains unchanged.
-- Only run in the PAVORA Supabase project's SQL Editor.
-- No account, messages, posts, follows, or media are deleted.

begin;

alter table public.profiles
  add column if not exists is_official boolean not null default false;

-- Fail safely before changing the verification rules if the supplied existing
-- profile ID, its current email, and its verified state do not all match.
do $$
begin
  if not exists (
    select 1
    from public.profiles p
    join auth.users u on u.id = p.id
    where p.id = '718557df-a80d-46ae-b95e-8f4cc9ecdb49'::uuid
      and lower(p.username) = 'pavora'
      and lower(u.email) = 'hackerwhitehat08@gmail.com'
      and u.email_confirmed_at is not null
  ) then
    raise exception 'Official account check failed. No changes made. Check account ID, handle, and verified email.';
  end if;
end;
$$;

-- The official badge is derived from the exact verified Auth account.
-- A client cannot award itself the badge by editing is_official.
create or replace function public.pv_guard_official_profile()
returns trigger
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  verified_owner boolean;
begin
  select exists (
    select 1 from auth.users u
    where u.id = new.id
      and u.id = '718557df-a80d-46ae-b95e-8f4cc9ecdb49'::uuid
      and lower(u.email) = 'hackerwhitehat08@gmail.com'
      and u.email_confirmed_at is not null
  ) into verified_owner;

  -- Existing @PAVORA stays with the existing user, but nobody else may
  -- newly claim the username by inserting or renaming a profile.
  if lower(new.username) = 'pavora' and not verified_owner then
    if tg_op = 'INSERT' or
       (tg_op = 'UPDATE' and lower(old.username) is distinct from 'pavora') then
      raise exception 'The @pavora username is reserved for the verified official account';
    end if;
  end if;

  new.is_official := verified_owner and lower(new.username) = 'pavora';
  return new;
end;
$$;

drop trigger if exists pv_official_profile_guard on public.profiles;
create trigger pv_official_profile_guard
before insert or update on public.profiles
for each row execute function public.pv_guard_official_profile();

-- Backfill only the existing official profile. Unrelated profiles are untouched.
update public.profiles
set is_official = true
where id = '718557df-a80d-46ae-b95e-8f4cc9ecdb49'::uuid
  and lower(username) = 'pavora';

commit;

-- After success, verify (should return one row with all true):
select
  p.username,
  p.display_name,
  p.is_official,
  lower(u.email) = 'hackerwhitehat08@gmail.com' as owner_email_matches,
  u.email_confirmed_at is not null as email_verified
from public.profiles p
join auth.users u on u.id = p.id
where p.id = '718557df-a80d-46ae-b95e-8f4cc9ecdb49'::uuid;
