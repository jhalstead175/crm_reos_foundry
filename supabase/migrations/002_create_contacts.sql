-- Contacts Table
-- Central hub for all leads and clients
create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),

  -- Basic Info
  name text not null,
  email text,
  phone text,

  -- CRM Fields
  lead_score text check (lead_score in ('A', 'B', 'C', 'D', 'F')) default 'C',
  source text check (source in ('Website', 'Zillow', 'Realtor.com', 'Referral', 'Past Client', 'Cold Call', 'Open House', 'Social Media', 'Other')) default 'Other',
  status text check (status in ('New Lead', 'Nurturing', 'Hot', 'Under Contract', 'Closed', 'Dead')) default 'New Lead',

  -- Dates
  created_at timestamptz default now() not null,
  last_contact_date timestamptz,
  next_follow_up_date timestamptz,

  -- Notes
  notes text,

  -- Additional fields for future use
  metadata jsonb default '{}'::jsonb
);

-- Contact Events Table
-- Log all communications with contacts
create table if not exists contact_events (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null,
  type text check (type in ('call', 'text', 'email', 'meeting', 'note')) not null,
  direction text check (direction in ('inbound', 'outbound')) default 'outbound',
  payload jsonb not null,
  created_at timestamptz default now() not null,

  constraint fk_contact
    foreign key (contact_id)
    references contacts(id)
    on delete cascade
);

-- Indexes for performance
create index if not exists idx_contacts_lead_score on contacts(lead_score);
create index if not exists idx_contacts_status on contacts(status);
create index if not exists idx_contacts_source on contacts(source);
create index if not exists idx_contacts_next_follow_up on contacts(next_follow_up_date);
create index if not exists idx_contacts_last_contact on contacts(last_contact_date);
create index if not exists idx_contact_events_contact_id on contact_events(contact_id);
create index if not exists idx_contact_events_created_at on contact_events(created_at desc);

-- Enable Row Level Security
alter table contacts enable row level security;
alter table contact_events enable row level security;

-- MVP Policy: Allow authenticated users full access
create policy "allow_authenticated_access_contacts"
on contacts
for all
using (auth.role() = 'authenticated');

create policy "allow_authenticated_access_contact_events"
on contact_events
for all
using (auth.role() = 'authenticated');

-- Comments for documentation
comment on table contacts is 'Central contact/lead management. Core of the CRM.';
comment on table contact_events is 'Append-only log of all contact communications.';
comment on column contacts.lead_score is 'A-F scoring for prioritization (A = hottest)';
comment on column contacts.source is 'Where this lead came from';
comment on column contacts.status is 'Current position in the sales pipeline';
