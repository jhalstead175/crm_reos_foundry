-- Properties Table
create table if not exists properties (
  id uuid primary key default gen_random_uuid(),

  -- Address
  address text not null,
  address_line1 text not null,
  city text not null,
  state text not null,
  zip_code text not null,
  county text,
  latitude decimal(10, 8),
  longitude decimal(11, 8),

  -- Property Details
  property_type text,
  bedrooms integer,
  bathrooms decimal(3, 1),
  square_footage integer,
  lot_size integer,
  year_built integer,

  -- Financial Data
  last_sale_date date,
  last_sale_price decimal(12, 2),
  assessed_value decimal(12, 2),
  estimated_value decimal(12, 2),
  estimated_rent decimal(10, 2),

  -- Additional
  features jsonb default '[]'::jsonb,
  notes text,

  -- Timestamps
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Property-Contact Relationships
create table if not exists property_contacts (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  contact_id uuid not null references contacts(id) on delete cascade,
  relationship text check (relationship in ('Buyer', 'Seller', 'Landlord', 'Tenant', 'Interest')) not null,
  created_at timestamptz default now() not null,

  unique(property_id, contact_id)
);

-- Property-Transaction Relationships
create table if not exists property_transactions (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  transaction_id uuid not null references transactions(id) on delete cascade,
  created_at timestamptz default now() not null,

  unique(property_id, transaction_id)
);

-- Indexes
create index if not exists idx_properties_address on properties(address);
create index if not exists idx_properties_city_state on properties(city, state);
create index if not exists idx_properties_zip_code on properties(zip_code);
create index if not exists idx_property_contacts_property_id on property_contacts(property_id);
create index if not exists idx_property_contacts_contact_id on property_contacts(contact_id);
create index if not exists idx_property_transactions_property_id on property_transactions(property_id);
create index if not exists idx_property_transactions_transaction_id on property_transactions(transaction_id);

-- RLS
alter table properties enable row level security;
alter table property_contacts enable row level security;
alter table property_transactions enable row level security;

-- Policies
create policy "allow_authenticated_access_properties"
on properties
for all
using (auth.role() = 'authenticated');

create policy "allow_authenticated_access_property_contacts"
on property_contacts
for all
using (auth.role() = 'authenticated');

create policy "allow_authenticated_access_property_transactions"
on property_transactions
for all
using (auth.role() = 'authenticated');

-- Comments
comment on table properties is 'Property listings with RentCast data integration';
comment on table property_contacts is 'Link properties to contacts with relationship type';
comment on table property_transactions is 'Link properties to transactions';
