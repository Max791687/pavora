-- PAVORA: one verified recovery email (root Auth user) may own two extra IDs.
-- Auth users remain independent, preserving the existing user-id-based RLS model.
create table if not exists public.pv_linked_accounts (
  root_id uuid not null references auth.users(id) on delete cascade,
  child_id uuid primary key references auth.users(id) on delete cascade,
  slot smallint not null check (slot in (2, 3)),
  created_at timestamptz not null default now(),
  unique (root_id, slot),
  check (root_id <> child_id)
);

alter table public.pv_linked_accounts enable row level security;
-- This ownership mapping is deliberately server-only: no grants or client RLS policies.
revoke all on public.pv_linked_accounts from anon, authenticated;
comment on table public.pv_linked_accounts is
  'Private mapping of up to two independent child Auth users to their verified email owner.';
