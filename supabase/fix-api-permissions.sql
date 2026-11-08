-- PAVORA permission repair for Supabase Data API
-- Run once in the PAVORA project's SQL Editor.
-- GRANT allows API roles to reach the tables; RLS still decides which rows they may access.
grant usage on schema public to anon, authenticated;
grant select on table public.profiles, public.posts, public.likes, public.comments, public.follows to anon;
grant select, insert, update, delete on table public.profiles, public.posts, public.likes, public.comments, public.follows to authenticated;
-- Identity/serial sequences, if any are added later, need their own grants.
-- Existing RLS policies remain enabled; verify them before opening to real users.
select tablename, rowsecurity from pg_tables
where schemaname='public' and tablename in ('profiles','posts','likes','comments','follows')
order by tablename;
