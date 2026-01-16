-- Add contact relationship to transactions
alter table transactions
add column contact_id uuid references contacts(id) on delete set null;

-- Index for performance
create index if not exists idx_transactions_contact_id on transactions(contact_id);

-- Comment
comment on column transactions.contact_id is 'Optional link to primary contact for this transaction';
