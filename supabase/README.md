# Supabase Database Setup

This directory contains SQL migrations for the Chronos REOS CRM database.

## Prerequisites

1. Create a Supabase project at https://app.supabase.com/
2. Note your project URL and anon key from Project Settings → API

## Setup Instructions

### 1. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2. Create Transactions Table (Prerequisites)

Before running task migrations, ensure you have a `transactions` table. If not, create it:

```sql
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  address text not null,
  type text not null,
  status text not null default 'active',
  created_at timestamptz default now() not null
);

alter table transactions enable row level security;

create policy "allow_authenticated_access_transactions"
on transactions
for all
using (auth.role() = 'authenticated');
```

### 3. Run Task Migrations

In the Supabase SQL Editor, run the migration file:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `migrations/001_create_tasks_and_events.sql`
4. Paste and execute

This will create:
- `transaction_tasks` table
- `transaction_events` table
- Indexes for performance
- Row Level Security policies

### 4. Enable Realtime (Required for Live Updates)

Enable Realtime for live cross-tab and multi-user sync:

1. Go to your Supabase project dashboard
2. Navigate to **Database** → **Replication**
3. Find the tables `transaction_tasks` and `transaction_events`
4. Enable Realtime for both tables by toggling the switch

**What this enables:**
- Live task updates across multiple browser tabs
- Real-time timeline synchronization
- Multi-user collaboration without page refresh
- Task Board auto-updates when tasks change

**Note:** Realtime is table-level, not row-level. No additional SQL needed.

### 5. Verify Setup

Run this query to verify tables exist:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
and table_name in ('transaction_tasks', 'transaction_events');
```

You should see both tables listed.

## Database Schema

### transaction_tasks

Stores tasks that belong exclusively to transactions.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| transaction_id | uuid | Foreign key to transactions |
| title | text | Task title |
| status | text | todo \| in_progress \| done |
| priority | text | high \| medium \| low |
| due_date | timestamptz | Optional due date |
| assignee | jsonb | Optional assignee info |
| created_at | timestamptz | Creation timestamp |

### transaction_events

Append-only event log for all transaction activities.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| transaction_id | uuid | Foreign key to transactions |
| type | text | Event type (task.created, etc.) |
| payload | jsonb | Event-specific data |
| created_at | timestamptz | Event timestamp |

## Event Types

Events stored in `transaction_events`:

- `task.created` - When a task is created
- `task.status_changed` - When task status changes
- `task.completed` - When task moves to "done"
- `system` - System-generated events
- `milestone` - Business milestones

## Security

Current RLS policies allow all authenticated users full access. This is acceptable for MVP.

**Future**: Implement role-based policies to restrict access based on user roles and transaction participation.

## Troubleshooting

### "relation does not exist" error

Ensure you've run the migration SQL in the correct Supabase project.

### Authentication errors

Verify your `VITE_SUPABASE_ANON_KEY` is correct and hasn't expired.

### No data showing

1. Check browser console for errors
2. Verify RLS policies are enabled
3. Ensure you're authenticated (future: add auth flow)

### Realtime not working

1. Verify Realtime is enabled for both tables in Database → Replication
2. Check browser console for connection errors
3. Ensure `.env` has correct Supabase URL and anon key
4. Try refreshing the page - Realtime reconnects automatically

**Note:** If Realtime disconnects, the app continues working normally. Manual refresh restores state.

## Architecture Notes

- **Frontend is mutation authority**: All changes originate in React components
- **Supabase is source of record**: Persists state, doesn't decide state
- **Events are append-only**: Never updated or deleted
- **Optimistic updates**: UI updates immediately, DB sync follows
- **Realtime subscriptions**: Live updates across tabs and users, with deduplication
- **Transaction-bound**: All tasks belong to exactly one transaction
- **Graceful degradation**: App works offline (minus realtime), state restored on refresh
