-- Transactions Table
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),

  -- Basic Info
  address text not null,
  type text check (type in ('Purchase', 'Sale', 'Lease', 'Other')) not null default 'Purchase',
  status text check (status in ('Active', 'Pending', 'Under Contract', 'Closed', 'Cancelled')) not null default 'Active',

  -- Financial
  price decimal(12, 2),
  commission_rate decimal(5, 2),
  estimated_commission decimal(12, 2),

  -- Dates
  listing_date date,
  contract_date date,
  closing_date date,

  -- Notes
  notes text,

  -- Timestamps
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Indexes
create index if not exists idx_transactions_status on transactions(status);
create index if not exists idx_transactions_type on transactions(type);
create index if not exists idx_transactions_closing_date on transactions(closing_date);

-- RLS
alter table transactions enable row level security;

-- Policy
create policy "allow_authenticated_access_transactions"
on transactions
for all
using (auth.role() = 'authenticated');

-- Comments
comment on table transactions is 'Real estate transactions (deals/listings)';
