-- PAVORA: follow @PAVORA from explicitly identified accounts controlled by the owner.
-- Run manually in Supabase SQL Editor (admin context). Never run against all auth.users.
-- Edit the owner_emails array ONLY to include accounts you personally control.
-- This file currently targets the separately registered Gmail account confirmed by owner.
-- The 100 front-end virtual creator cards are not registered Auth users and cannot follow.

begin;

do $$
declare
  official_id uuid := '718557df-a80d-46ae-b95e-8f4cc9ecdb49'::uuid;
  owner_emails text[] := array[
    'max791687@gmail.com'
    -- Add other emails YOU own here, separated by commas.
  ];
  missing_emails text[];
begin
  if not exists (
    select 1
    from public.profiles p
    join auth.users u on u.id=p.id
    where p.id=official_id
      and lower(p.username)='pavora'
      and p.is_official=true
      and lower(u.email)='hackerwhitehat08@gmail.com'
  ) then
    raise exception 'Verified @PAVORA official account not found: no follows added';
  end if;

  -- Safety: each specifically named user must have a registered profile.
  select array_agg(email) into missing_emails
  from unnest(owner_emails) as email
  where not exists (
    select 1 from auth.users u
    join public.profiles p on p.id=u.id
    where lower(u.email)=lower(email)
  );
  if missing_emails is not null then
    raise exception 'These explicitly owned accounts have no registered profile: %',missing_emails;
  end if;

  insert into public.follows (follower_id, following_id)
  select p.id, official_id
  from public.profiles p
  join auth.users u on u.id=p.id
  where lower(u.email)=any(select lower(e) from unnest(owner_emails) e)
    and p.id<>official_id
    and not exists (
      select 1 from public.follows f
      where f.follower_id=p.id and f.following_id=official_id
    );
end;
$$;

commit;

-- Confirm exactly which listed accounts follow the verified official profile:
select lower(u.email) as owned_account, p.username,
       exists (select 1 from public.follows f
               where f.follower_id=p.id
                 and f.following_id='718557df-a80d-46ae-b95e-8f4cc9ecdb49'::uuid)
       as follows_pavora
from auth.users u
join public.profiles p on p.id=u.id
where lower(u.email) in ('max791687@gmail.com')
order by owned_account;
