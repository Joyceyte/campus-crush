---
status: incomplete
date: 2026-08-15
---

# Quick task: minimal Square pilot signup

Implements the payment-critical slice of
`docs/superpowers/specs/2026-08-15-square-pilot-signup-design.md`.

## Built

| File | Purpose |
|---|---|
| `supabase/pilot-signups.sql` | `pilot_signups` table, RLS on with no policies |
| `lib/pilot.ts` | Eligibility, close date, AU phone normalisation |
| `lib/square.ts` | Square REST helpers (raw fetch, no SDK) |
| `lib/supabase-admin.ts` | Service-role client |
| `app/actions/join-pilot.ts` | Server action: validate → insert → mint link → redirect |
| `components/JoinPilotModal.tsx` | Join form, opened via `open-join-pilot` event |
| `app/pilot/success/page.tsx` | Verifies payment against Square, then marks paid |
| `components/Hero.tsx` | CTA → "Join the pilot"; countdown → "closes 20 august" |
| `app/page.tsx` | Mounts `<JoinPilotModal />` |

## Verified

- `npx tsc --noEmit` clean
- `npm run build` passes; `/pilot/success` renders dynamically
- Square sandbox spike (earlier): AU/AUD account, `reference_id` round-trips,
  A$5.00 payment reads back as `COMPLETED`

## NOT verified

End-to-end signup has **not** been run, because `pilot-signups.sql` has not been
applied to Supabase. Nothing writes until it is.

## Deferred

Founders' pop-up, confirmation email, newsletter/`FinalCTA` restructure,
reconciliation sweep, remaining hero copy.
