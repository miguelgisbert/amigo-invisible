create table if not exists users (
  id uuid primary key,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists sessions (
  token_hash text primary key,
  user_id uuid not null references users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists sessions_user_id_idx on sessions(user_id);
create index if not exists sessions_expires_at_idx on sessions(expires_at);

create table if not exists draws (
  id uuid primary key,
  owner_id uuid references users(id) on delete set null,
  admin_token text not null unique,
  locale text not null default 'ca' check (locale in ('ca', 'es')),
  name text not null,
  budget numeric(10, 2),
  event_date text,
  event_time text,
  location text,
  template text not null,
  created_at timestamptz not null default now(),
  drawn_at timestamptz
);

create index if not exists draws_owner_id_idx on draws(owner_id);
create index if not exists draws_created_at_idx on draws(created_at);

create table if not exists participants (
  id uuid primary key,
  draw_id uuid not null references draws(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  token text not null unique,
  giver_of_id uuid,
  last_sent_at timestamptz,
  last_sent_channel text check (last_sent_channel in ('whatsapp', 'email')),
  created_at timestamptz not null default now()
);

create index if not exists participants_draw_id_idx on participants(draw_id);
create index if not exists participants_token_idx on participants(token);

create table if not exists exclusions (
  draw_id uuid not null references draws(id) on delete cascade,
  a_id uuid not null references participants(id) on delete cascade,
  b_id uuid not null references participants(id) on delete cascade,
  primary key (draw_id, a_id, b_id)
);


create table if not exists feedback (
  id uuid primary key,
  source text not null default 'amigo-invisible',
  kind text not null check (kind in ('error', 'suggestion', 'other')),
  message text not null,
  email text,
  page text,
  locale text not null check (locale in ('ca', 'es')),
  created_at timestamptz not null default now()
);

create index if not exists feedback_created_at_idx on feedback(created_at desc);
