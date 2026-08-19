-- Adds "how did you hear about us" to the waitlist signup, so the team can
-- see which channels are actually driving signups. Run this in the Supabase
-- SQL editor.
alter table public.waitlist
  add column if not exists heard_from text;
