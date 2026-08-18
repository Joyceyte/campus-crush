-- Adds phone number collection to the waitlist signup, so the team can text
-- (not just email) people on the list. Run this in the Supabase SQL editor.
--
-- No existing supabase/waitlist.sql exists to add this to directly — the
-- waitlist table predates the supabase/*.sql migration convention used
-- elsewhere in this repo, so this ships as a standalone alter statement.
alter table public.waitlist
  add column if not exists phone text;   -- E.164, e.g. +61412345678
