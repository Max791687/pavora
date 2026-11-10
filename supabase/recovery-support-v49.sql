-- PAVORA v49 account recovery support. Already applied to Supabase.
-- Requests are only readable through the authenticated owner-admin Edge Function.
-- Do NOT expose INSERT / SELECT to anon or authenticated roles.
create table if not exists public.pv_recovery_requests (
 id uuid primary key default gen_random_uuid(),
 email text not null,
 issue text not null default 'Cannot access my account',
 status text not null default 'pending' check (status in ('pending','reviewing','closed')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists pv_recovery_recent on public.pv_recovery_requests(created_at desc);
create index if not exists pv_recovery_email_recent on public.pv_recovery_requests(email,created_at desc);
alter table public.pv_recovery_requests enable row level security;
revoke all on public.pv_recovery_requests from anon,authenticated;
