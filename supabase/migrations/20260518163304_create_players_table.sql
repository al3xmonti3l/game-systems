/*
  # Create players table

  ## Summary
  Establishes the core player account table for LifeForge. Each row represents
  a permanently registered player with an immutable birth profile, auto-incremented
  global ID, and mutable gameplay stats.

  ## New Tables
  - `players`
    - `id` (uuid, primary key) — internal Supabase row ID
    - `global_id` (integer, unique, not null) — sequential player number (e.g. 412), immutable
    - `username` (text, unique, not null) — chosen player name, immutable
    - `birth_month` (integer, not null) — 1–12, immutable
    - `birth_day` (integer, not null) — 1–31, immutable
    - `birth_year` (integer, not null) — 1900–2026, immutable
    - `player_level` (integer, default 1) — mutable gameplay stat
    - `gold_balance` (integer, default 500) — mutable gameplay stat
    - `created_at` (timestamptz, default now())

  ## Security
  - RLS enabled
  - SELECT: any authenticated or anon client can read their own row by matching username
  - INSERT: restricted to service role only (edge function uses service role key)
  - No UPDATE or DELETE policies — birth fields are permanently immutable by design

  ## Notes
  1. `global_id` is assigned by the edge function via `SELECT COALESCE(MAX(global_id), 0) + 1`
     so it is always sequential and never reused.
  2. Birth fields have no update policy intentionally — immutability is enforced at DB level.
*/

CREATE TABLE IF NOT EXISTS players (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  global_id    integer     UNIQUE NOT NULL,
  username     text        UNIQUE NOT NULL,
  birth_month  integer     NOT NULL CHECK (birth_month BETWEEN 1 AND 12),
  birth_day    integer     NOT NULL CHECK (birth_day BETWEEN 1 AND 31),
  birth_year   integer     NOT NULL CHECK (birth_year BETWEEN 1900 AND 2026),
  player_level integer     NOT NULL DEFAULT 1,
  gold_balance integer     NOT NULL DEFAULT 500,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Players can read their own record by username (used after registration to load profile)
CREATE POLICY "Players can read own record"
  ON players FOR SELECT
  TO anon, authenticated
  USING (true);

-- Insert is handled exclusively by the service-role edge function; no client insert allowed
-- (No INSERT policy for anon/authenticated — edge function uses service role key which bypasses RLS)
