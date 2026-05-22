/*
  # Add combat_class, constellation_title, zodiac_title to players

  ## Summary
  Extends the players table with three new columns to persist the player's
  chosen combat class and their two auto-calculated titles (western constellation
  and Chinese zodiac). All three are nullable until the player completes
  class selection onboarding.

  ## Modified Tables
  - `players`
    - `combat_class` (text, nullable) — one of 9 class names, set during onboarding
    - `constellation_title` (text, nullable) — western zodiac sign title, derived from birth date
    - `zodiac_title` (text, nullable) — Chinese zodiac animal title, derived from birth year

  ## Notes
  1. Columns are nullable so existing rows are not broken.
  2. No UPDATE policy is added for birth fields; class/title fields are separate
     and updated by the set-class edge function using the service role key.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'players' AND column_name = 'combat_class'
  ) THEN
    ALTER TABLE players ADD COLUMN combat_class text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'players' AND column_name = 'constellation_title'
  ) THEN
    ALTER TABLE players ADD COLUMN constellation_title text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'players' AND column_name = 'zodiac_title'
  ) THEN
    ALTER TABLE players ADD COLUMN zodiac_title text;
  END IF;
END $$;
