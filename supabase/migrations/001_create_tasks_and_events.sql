-- Transaction Tasks Table
-- Tasks belong exclusively to transactions
create table if not exists transaction_tasks (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null,
  title text not null,
  status text check (status in ('todo', 'in_progress', 'done')) not null default 'todo',
  priority text check (priority in ('high', 'medium', 'low')) not null default 'medium',
  due_date timestamptz,
  assignee jsonb,
  created_at timestamptz default now() not null,

  constraint fk_transaction
    foreign key (transaction_id)
    references transactions(id)
    on delete cascade
);

-- Transaction Events Table
-- Append-only event log for all transaction activities
create table if not exists transaction_events (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null,
  type text not null,
  payload jsonb not null,
  created_at timestamptz default now() not null,

  constraint fk_transaction
    foreign key (transaction_id)
    references transactions(id)
    on delete cascade
);

-- Indexes for performance
create index if not exists idx_transaction_tasks_transaction_id on transaction_tasks(transaction_id);
create index if not exists idx_transaction_tasks_status on transaction_tasks(status);
create index if not exists idx_transaction_events_transaction_id on transaction_events(transaction_id);
create index if not exists idx_transaction_events_type on transaction_events(type);
create index if not exists idx_transaction_events_created_at on transaction_events(created_at desc);

-- Enable Row Level Security
alter table transaction_tasks enable row level security;
alter table transaction_events enable row level security;

-- MVP Policy: Allow authenticated users full access
-- (Will be refined with role-based policies later)
create policy "allow_authenticated_access_tasks"
on transaction_tasks
for all
using (auth.role() = 'authenticated');

create policy "allow_authenticated_access_events"
on transaction_events
for all
using (auth.role() = 'authenticated');

-- Comments for documentation
comment on table transaction_tasks is 'Tasks that belong to transactions. Frontend is mutation authority.';
comment on table transaction_events is 'Append-only event log. Never updated or deleted.';
comment on column transaction_tasks.assignee is 'JSONB to future-proof for complex assignee structures';
comment on column transaction_events.payload is 'Event-specific data stored as JSONB for flexibility';
