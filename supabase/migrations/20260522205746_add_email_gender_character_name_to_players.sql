/*
  # Add email, gender, and character_name to players

  ## Summary
  Extends the players table to support real email-based Supabase Auth, a separate
  in-game character name, and a gender identity field.

  ## Modified Tables
  - `players`
    - `email` (text, nullable) — real email address used for Supabase Auth
    - `character_name` (text, nullable) — in-game handle chosen by the player (e.g. mönta7e)
    - `gender` (text, nullable) — player character gender identity: 'Male' or 'Female'

  ## Notes
  1. All three columns are nullable so existing rows (created before this migration) are not broken.
  2. `email` is stored for reference but authentication is handled entirely by auth.users.
  3. `character_name` becomes the display name / handle going forward;
     `username` is kept for backward compatibility.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'players' AND column_name = 'email'
  ) THEN
    ALTER TABLE players ADD COLUMN email text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'players' AND column_name = 'character_name'
  ) THEN
    ALTER TABLE players ADD COLUMN character_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'players' AND column_name = 'gender'
  ) THEN
    ALTER TABLE players ADD COLUMN gender text CHECK (gender IN ('Male', 'Female'));
  END IF;
END $$;
