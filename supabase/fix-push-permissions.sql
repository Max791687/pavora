-- PAVORA push delivery permission hotfix (error 42501).
-- Run in Supabase SQL Editor. Safe to run again.
-- Grants only the trusted server-side service_role, not anon/authenticated.
grant select,update on public.push_jobs to service_role;
grant select,delete on public.push_subscriptions to service_role;
grant select on public.profiles to service_role;
