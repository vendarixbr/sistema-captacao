create table landing_pages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  published boolean default false,
  copy jsonb not null default '{}',
  images jsonb not null default '{}',
  theme text default 'rose-gold',
  pagemode text default 'landing'
);

create index on landing_pages (slug);
create index on landing_pages (published);

-- Migration para bases existentes (rodar no Supabase SQL Editor):
-- ALTER TABLE landing_pages ADD COLUMN IF NOT EXISTS theme text DEFAULT 'rose-gold';
-- ALTER TABLE landing_pages ADD COLUMN IF NOT EXISTS pagemode text DEFAULT 'landing';
