-- Adds age and sexuality to the waitlist signup, so matching has this data
-- for everyone who's expressed interest, not just paid pilot signups. Run
-- this in the Supabase SQL editor.
alter table public.waitlist
  add column if not exists age int;
alter table public.waitlist
  add column if not exists sexuality text;
