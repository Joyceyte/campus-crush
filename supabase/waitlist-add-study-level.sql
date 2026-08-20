-- Adds year/level of study (undergrad, honours, masters, phd, other) to the
-- waitlist signup. Run this in the Supabase SQL editor.
alter table public.waitlist
  add column if not exists study_level text;
