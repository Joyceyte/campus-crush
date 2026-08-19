-- Semester 2, 2026 pilot signups. Run this in the Supabase SQL editor.
--
-- One row per student who starts the join flow. The row is created BEFORE
-- payment (status 'pending') so that Square has something to point back at:
-- the row's id travels to Square as the order's reference_id and comes back
-- on the order, which is how a payment is matched to a student.
--
-- Payment truth always comes from the Square API, never from the browser
-- redirect. See docs/superpowers/specs/2026-08-15-square-pilot-signup-design.md
--
-- No auth.users foreign key on id: the pilot has no accounts. claimed_by is
-- the forward link for when Google sign-in ships and a student claims the
-- spot they already paid for.

create table if not exists public.pilot_signups (
  id                         uuid primary key default gen_random_uuid(),

  full_name                  text not null,
  email                      text not null unique,   -- lowercased UniMelb address
  phone                      text not null,          -- E.164, e.g. +61412345678
  university                 text,
  gender                     text,   -- male / female / non-binary / other
  heard_from                 text,   -- instagram / tiktok / friend / poster / campus-event / other
  -- Opt-in "sign up with a friend" for a group date. Honor system: not
  -- verified against a matching row on the friend's own signup — the team
  -- manually cross-checks both people signed up when pairing weekly matches.
  friend_email               text,
  -- A timestamp rather than a boolean: the checkbox is a legal claim, so when
  -- it was made is part of the record.
  over_18_confirmed_at       timestamptz not null default now(),

  payment_status             text not null default 'pending'
                               check (payment_status in
                                 ('pending','paid','failed','refunded')),
  square_payment_link_id     text,
  square_payment_link_url    text,   -- lets us re-offer an unfinished checkout
  square_order_id            text,   -- the key we ask Square about
  square_payment_id          text,
  amount_cents               int,
  currency                   text not null default 'AUD',
  paid_at                    timestamptz,
  refunded_at                timestamptz,
  refund_amount_cents        int,

  confirmation_email_sent_at timestamptz,

  claimed_by                 uuid references auth.users(id),
  claimed_at                 timestamptz,

  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now()
);

create index if not exists pilot_signups_payment_status_idx
  on public.pilot_signups (payment_status);
create index if not exists pilot_signups_square_order_id_idx
  on public.pilot_signups (square_order_id);

-- RLS on with NO policies: nothing in this table is reachable from a browser
-- client, anonymous or authenticated. Every read and write goes through the
-- server using the service-role key, which bypasses RLS by design.
alter table public.pilot_signups enable row level security;

-- Migrations for a pilot_signups table created before these columns
-- existed. Safe to re-run: no-op if a column is already there.
alter table public.pilot_signups
  add column if not exists friend_email text;
alter table public.pilot_signups
  add column if not exists gender text;
alter table public.pilot_signups
  add column if not exists heard_from text;
