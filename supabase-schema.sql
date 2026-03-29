-- Bird game analytics schema
-- Run this in your Supabase SQL editor (supabase.com → your project → SQL Editor)

create table game_events (
  id           bigserial primary key,
  created_at   timestamptz default now(),
  session_id   uuid        not null,
  question_number smallint,
  difficulty   text,           -- effective difficulty: easy/medium/hard/expert
  selected_difficulty text,   -- what user chose: easy/medium/hard/expert/auto
  real_bird_1  text,
  real_bird_2  text,
  fake_bird    text,
  picked_name  text,           -- the bird name the user tapped
  correct      boolean,
  response_time_ms integer,
  mobile       boolean
);

-- Row-level security: allow anonymous inserts (from the game) and reads (for dashboard)
alter table game_events enable row level security;

create policy "anon insert"
  on game_events for insert to anon with check (true);

create policy "anon select"
  on game_events for select to anon using (true);

-- Useful index for dashboard time-series queries
create index on game_events (created_at desc);
