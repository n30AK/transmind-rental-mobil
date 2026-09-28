-- NEXUS Autonomous Runtime v1
create table if not exists public.nexus_runtime_runs (
  id uuid primary key default gen_random_uuid(),
  run_id text not null unique,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'RUNNING' check (status in ('RUNNING','PASS','ANOMALY','ERROR')),
  trigger text not null default 'SCHEDULED',
  duration_ms integer,
  summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists nexus_runtime_runs_started_at_idx on public.nexus_runtime_runs (started_at desc);

create table if not exists public.nexus_measurements (
  id uuid primary key default gen_random_uuid(),
  run_id text not null references public.nexus_runtime_runs(run_id) on delete cascade,
  source text not null,
  metric text not null,
  value_numeric double precision,
  value_text text,
  state text not null check (state in ('DATA_AVAILABLE','NO_DATA','DATA_UNAVAILABLE','DATA_STALE','UNKNOWN')),
  observed_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);
create index if not exists nexus_measurements_run_idx on public.nexus_measurements (run_id, observed_at desc);

create table if not exists public.nexus_incidents (
  id uuid primary key default gen_random_uuid(),
  run_id text references public.nexus_runtime_runs(run_id) on delete set null,
  incident_key text not null,
  severity text not null check (severity in ('INFO','LOW','MEDIUM','HIGH','CRITICAL')),
  state text not null default 'OPEN' check (state in ('OPEN','ACKNOWLEDGED','RESOLVED','ESCALATED')),
  detected_at timestamptz not null default now(),
  diagnosis jsonb not null default '{}'::jsonb,
  evidence jsonb not null default '{}'::jsonb,
  confidence numeric(5,4),
  resolved_at timestamptz
);
create index if not exists nexus_incidents_detected_idx on public.nexus_incidents (detected_at desc);

create table if not exists public.nexus_actions (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid references public.nexus_incidents(id) on delete set null,
  run_id text references public.nexus_runtime_runs(run_id) on delete set null,
  action_type text not null,
  risk_level text not null check (risk_level in ('L0','L1','L2','L3','L4')),
  authorization_state text not null default 'NOT_REQUIRED',
  execution_state text not null default 'PLANNED',
  plan jsonb not null default '{}'::jsonb,
  result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  executed_at timestamptz,
  verified_at timestamptz
);

alter table public.nexus_runtime_runs enable row level security;
alter table public.nexus_measurements enable row level security;
alter table public.nexus_incidents enable row level security;
alter table public.nexus_actions enable row level security;
-- No anon/authenticated policies: server-side runtime uses service role.
