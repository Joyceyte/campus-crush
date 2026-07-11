-- Partnered venues showcased in the Restaurant Partnerships section.
-- Run this in the campus-crush Supabase project's SQL editor.
--
-- photo_url: venue photo shown inside the polaroid frame
-- logo_url:  venue logo chip pinned to the bottom corner of the photo
-- discount:  the perk text, e.g. "15% off your first date"
-- Upload images to a public storage bucket (or any host) and paste the URLs.

create table if not exists public.venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  discount text not null,
  photo_url text,
  logo_url text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.venues enable row level security;

-- The site reads venues with the anon key; only active rows are visible.
create policy "Public can read active venues"
  on public.venues for select
  to anon
  using (is_active);

-- Public bucket for venue photos + logos (skip if you host images elsewhere).
insert into storage.buckets (id, name, public)
values ('venue-assets', 'venue-assets', true)
on conflict (id) do nothing;

-- Example: fill the first partner slot (edit values, then run).
-- The site shows 5 slots; rows fill them in sort_order, the rest say "Coming soon".
-- insert into public.venues (name, discount, photo_url, logo_url, sort_order)
-- values (
--   'Flovie Florist Cafe',
--   '15% off your first date',
--   'https://<project>.supabase.co/storage/v1/object/public/venue-assets/flovie-photo.jpg',
--   'https://<project>.supabase.co/storage/v1/object/public/venue-assets/flovie-logo.png',
--   1
-- );
