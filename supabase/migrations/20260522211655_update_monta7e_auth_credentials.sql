/*
  # Update auth credentials for player MÖNTA7E

  ## Summary
  Updates the Supabase auth.users record for global_id 1 (MÖNTA7E) from the
  placeholder fake email to their real email address, and sets their password.

  ## Changes
  - auth.users: email updated to montazemusic@gmail.com
  - auth.users: password updated to new value
  - auth.users: email_confirmed_at set to ensure login works
*/

UPDATE auth.users
SET
  email                = 'montazemusic@gmail.com',
  encrypted_password   = crypt('99Runner', gen_salt('bf')),
  email_confirmed_at   = COALESCE(email_confirmed_at, now()),
  updated_at           = now()
WHERE id = 'b7dbfd6a-5a82-4330-a217-cde949512adc';
