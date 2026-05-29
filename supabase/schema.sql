create table landing_pages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  published boolean default false,
  copy jsonb not null default '{}',
  images jsonb not null default '{}'
);

create index on landing_pages (slug);
create index on landing_pages (published);
