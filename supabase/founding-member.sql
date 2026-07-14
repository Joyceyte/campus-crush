-- Founding-member tag for the waitlist.
-- Run this in the Supabase SQL editor BEFORE deploying the app change —
-- the waitlist insert now sends this column, so signups will fail until
-- the column exists.
--
-- The first 80 real signups are founding members: with the +20 momentum
-- padding shown on the site they fill the displayed 100-spot goal. Anyone
-- who joins after the countdown hits 0 doesn't get the tag.

alter table public.waitlist
  add column if not exists founding_member boolean not null default false;

-- Backfill: tag the earliest 80 signups already on the list.
update public.waitlist
set founding_member = true
where id in (
  select id
  from public.waitlist
  order by created_at asc
  limit 80
);
