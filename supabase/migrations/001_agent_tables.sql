-- Culinova Assistant admin schema
-- All tables use the unique `agent_` prefix so they never collide with
-- other projects sharing this Supabase database.

create extension if not exists pgcrypto;

-- ============ Tables ============

create table if not exists public.agent_admin_users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text not null default '',
  role text not null default 'staff' check (role in ('admin', 'staff')),
  created_by uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.agent_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  company text not null default '',
  phone text not null default '',
  email text not null default '',
  sector text not null default '',
  interest text not null default '',
  source text not null default 'chat' check (source in ('chat', 'voice')),
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'closed')),
  created_at timestamptz not null default now()
);

create table if not exists public.agent_conversations (
  id uuid primary key default gen_random_uuid(),
  session_key text unique,
  visitor text not null default 'Visitor',
  channel text not null default 'chat' check (channel in ('chat', 'voice')),
  language text not null default 'English',
  started_at timestamptz not null default now(),
  duration_min integer not null default 0,
  messages_count integer not null default 0,
  lead_captured boolean not null default false,
  satisfaction integer not null default 0,
  transcript jsonb not null default '[]'::jsonb
);

create table if not exists public.agent_training_entries (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'Company',
  content text not null,
  status text not null default 'draft' check (status in ('published', 'draft')),
  updated_at timestamptz not null default now()
);

create table if not exists public.agent_settings (
  id integer primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.agent_audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid,
  actor_email text not null default '',
  action text not null,
  target text not null default '',
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists agent_leads_created_at_idx on public.agent_leads (created_at desc);
create index if not exists agent_conversations_started_at_idx on public.agent_conversations (started_at desc);
create index if not exists agent_audit_logs_created_at_idx on public.agent_audit_logs (created_at desc);

-- ============ Role helpers ============

create or replace function public.agent_is_member()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (select 1 from public.agent_admin_users where id = auth.uid());
$$;

create or replace function public.agent_is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.agent_admin_users
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ============ Row level security ============

alter table public.agent_admin_users enable row level security;
alter table public.agent_leads enable row level security;
alter table public.agent_conversations enable row level security;
alter table public.agent_training_entries enable row level security;
alter table public.agent_settings enable row level security;
alter table public.agent_audit_logs enable row level security;

-- Staff can only see their own profile; admins see everyone.
drop policy if exists agent_admin_users_select on public.agent_admin_users;
create policy agent_admin_users_select on public.agent_admin_users
  for select using (id = auth.uid() or public.agent_is_admin());

-- Leads: members read/write, only admins delete.
drop policy if exists agent_leads_select on public.agent_leads;
create policy agent_leads_select on public.agent_leads
  for select using (public.agent_is_member());

drop policy if exists agent_leads_insert on public.agent_leads;
create policy agent_leads_insert on public.agent_leads
  for insert with check (public.agent_is_member());

drop policy if exists agent_leads_update on public.agent_leads;
create policy agent_leads_update on public.agent_leads
  for update using (public.agent_is_member());

drop policy if exists agent_leads_delete on public.agent_leads;
create policy agent_leads_delete on public.agent_leads
  for delete using (public.agent_is_admin());

-- Conversations: members read, admins delete.
drop policy if exists agent_conversations_select on public.agent_conversations;
create policy agent_conversations_select on public.agent_conversations
  for select using (public.agent_is_member());

drop policy if exists agent_conversations_delete on public.agent_conversations;
create policy agent_conversations_delete on public.agent_conversations
  for delete using (public.agent_is_admin());

-- Training: members read, admins write.
drop policy if exists agent_training_select on public.agent_training_entries;
create policy agent_training_select on public.agent_training_entries
  for select using (public.agent_is_member());

drop policy if exists agent_training_insert on public.agent_training_entries;
create policy agent_training_insert on public.agent_training_entries
  for insert with check (public.agent_is_admin());

drop policy if exists agent_training_update on public.agent_training_entries;
create policy agent_training_update on public.agent_training_entries
  for update using (public.agent_is_admin());

drop policy if exists agent_training_delete on public.agent_training_entries;
create policy agent_training_delete on public.agent_training_entries
  for delete using (public.agent_is_admin());

-- Settings: admin only.
drop policy if exists agent_settings_select on public.agent_settings;
create policy agent_settings_select on public.agent_settings
  for select using (public.agent_is_admin());

drop policy if exists agent_settings_upsert on public.agent_settings;
create policy agent_settings_upsert on public.agent_settings
  for insert with check (public.agent_is_admin());

drop policy if exists agent_settings_update on public.agent_settings;
create policy agent_settings_update on public.agent_settings
  for update using (public.agent_is_admin());

-- Audit logs: members write, only admins read. Nobody edits or deletes.
drop policy if exists agent_audit_logs_insert on public.agent_audit_logs;
create policy agent_audit_logs_insert on public.agent_audit_logs
  for insert with check (public.agent_is_member());

drop policy if exists agent_audit_logs_select on public.agent_audit_logs;
create policy agent_audit_logs_select on public.agent_audit_logs
  for select using (public.agent_is_admin());

-- ============ Realtime ============

do $$ begin
  alter publication supabase_realtime add table public.agent_leads;
exception when duplicate_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table public.agent_conversations;
exception when duplicate_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table public.agent_audit_logs;
exception when duplicate_object then null; end $$;

-- ============ Seed defaults ============

insert into public.agent_settings (id, data)
values (1, '{}'::jsonb)
on conflict (id) do nothing;
