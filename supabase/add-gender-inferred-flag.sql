-- Marks which gender values were inferred from a name (not reported by the
-- person themselves) versus genuinely provided at signup. Run this in the
-- Supabase SQL editor before any inferred values get written.
alter table public.waitlist
  add column if not exists gender_inferred boolean not null default false;
alter table public.pilot_signups
  add column if not exists gender_inferred boolean not null default false;
