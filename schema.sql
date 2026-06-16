create table users (
  id text primary key,
  display_name text not null,
  role text not null check (role in ('student', 'teacher', 'mentor')),
  created_at timestamptz not null default now()
);

create table user_profiles (
  user_id text primary key references users(id) on delete cascade,
  email text,
  school text,
  grade text,
  region text,
  initial_interest text,
  quest integer not null default 0,
  joy integer not null default 0,
  exploration_distance integer not null default 0,
  reflection_power integer not null default 0,
  selected_event_id text,
  interests text[] not null default '{}',
  streak integer not null default 0,
  last_active_date date,
  updated_at timestamptz not null default now()
);

create table events (
  id text primary key,
  created_by text references users(id) on delete set null,
  title text not null,
  description text not null,
  exploration_index integer not null,
  impact text not null,
  tags text[] not null default '{}',
  keywords text[] not null default '{}',
  question_path text[] not null default '{}',
  color text,
  location_name text,
  event_type text not null default 'permanent',
  start_date date,
  end_date date,
  latitude numeric,
  longitude numeric,
  character_name text,
  character_role text,
  character_message text,
  character_local_only boolean not null default true,
  user_created boolean not null default false,
  created_at timestamptz not null default now()
);

create table sparks (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references users(id) on delete cascade,
  text text not null,
  source text,
  created_at timestamptz not null default now()
);

create table event_participations (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references users(id) on delete cascade,
  event_id text not null references events(id) on delete cascade,
  depth integer not null check (depth between 1 and 5),
  quest_delta integer not null default 0,
  participated_at timestamptz not null default now()
);

create table reflections (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references users(id) on delete cascade,
  event_id text not null references events(id) on delete cascade,
  participation_id uuid references event_participations(id) on delete set null,
  depth integer not null check (depth between 1 and 5),
  reflection text,
  hypothesis text,
  quest_delta integer not null default 0,
  created_at timestamptz not null default now()
);

create table field_posts (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references users(id) on delete cascade,
  event_id text not null references events(id) on delete cascade,
  body text,
  has_photo boolean not null default false,
  photo_name text,
  latitude numeric,
  longitude numeric,
  accuracy numeric,
  depth integer not null default 1 check (depth between 1 and 5),
  quest_delta integer not null default 0,
  joy_delta integer not null default 0,
  created_at timestamptz not null default now()
);

create table mentor_feedbacks (
  id uuid primary key default gen_random_uuid(),
  reflection_id uuid references reflections(id) on delete cascade,
  student_id text not null references users(id) on delete cascade,
  mentor_id text references users(id) on delete set null,
  kind text not null check (kind in ('question', 'connection', 'evidence', 'next')),
  comment text not null,
  next_question text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index idx_sparks_user_created_at on sparks(user_id, created_at desc);
create index idx_events_created_by on events(created_by, created_at desc);
create index idx_participations_user_event on event_participations(user_id, event_id);
create index idx_reflections_user_created_at on reflections(user_id, created_at desc);
create index idx_field_posts_user_created_at on field_posts(user_id, created_at desc);
create index idx_field_posts_event_created_at on field_posts(event_id, created_at desc);
create index idx_feedbacks_student_created_at on mentor_feedbacks(student_id, created_at desc);
create index idx_activity_logs_user_created_at on activity_logs(user_id, created_at desc);
