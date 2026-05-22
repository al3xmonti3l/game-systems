/*
  # Link players to Supabase Auth

  ## Summary
  Adds an `auth_user_id` column to `players` that references `auth.users`,
  enabling Supabase email/password authentication to be tied to each player record.

  ## Modified Tables
  - `players`
    - `auth_user_id` (uuid, nullable, references auth.users) — Supabase auth UID

  ## Security
  - Replaces the open SELECT policy with one that lets users read only their own row
    by matching auth.uid() to auth_user_id

  ## Notes
  1. Column is nullable so existing rows are preserved.
  2. INSERT remains service-role only (edge function handles user creation + row insert atomically).
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'players' AND column_name = 'auth_user_id'
  ) THEN
    ALTER TABLE players ADD COLUMN auth_user_id uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Drop old open SELECT policy and replace with auth-gated one
DROP POLICY IF EXISTS "Players can read own record" ON players;

CREATE POLICY "Authenticated users can read own player row"
  ON players FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_user_id);
