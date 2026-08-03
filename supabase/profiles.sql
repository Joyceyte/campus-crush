-- Dedicated profiles table (separate from waitlist/venues), one row per
-- authenticated user. Run this in the Supabase SQL editor.
--
-- Schema is deliberately wide: it anticipates every Phase 3 onboarding
-- field (photo, demographics, interests, dating intention, meal
-- availability, match preferences) so no mid-milestone follow-up
-- migration is needed.
--
-- photo_path stores a storage OBJECT PATH (e.g. '{userId}/face.jpg' in
-- the private 'photos' bucket — see photos-storage.sql), never a public
-- URL. Reads go through a signed URL created server-side at read time.
--
-- The four payment/eligibility columns below are populated in Phase 3 by
-- matching the signed-in user's email against the existing
-- public.waitlist table's founding_member column. This file does NOT
-- modify waitlist.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,

  -- Profile basics (FORM-02/03/04)
  photo_path text,                          -- e.g. '{userId}/face.jpg' in the 'photos' bucket
  age int,
  sex text,
  height_cm int,
  ethnicity text,
  interests text[] not null default '{}',   -- free-text tags
  dating_intention text,

  -- Availability (FORM-05)
  meal_availability text[] not null default '{}',   -- subset of {'breakfast','lunch','dinner'}
  available_dates date[] not null default '{}',      -- rolling 14-day multi-select

  -- Match preferences (FORM-06)
  pref_interested_in text[] not null default '{}',  -- subset of {'women','men','other'}
  pref_age_min int,
  pref_age_max int,
  pref_ethnicity text[] not null default '{}',       -- multi-select
  pref_height_cm int,
  pref_similar_interests boolean not null default false, -- unticked = no preference

  -- Payment/eligibility snapshot (DATA-05). These hold Stripe IDs only —
  -- never Stripe secret/publishable keys. Written server-side in Phase 3.
  is_founding_member boolean,          -- snapshot of eligibility at onboarding, from public.waitlist.founding_member
  payment_required boolean,
  stripe_customer_id text,
  stripe_payment_method_id text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
