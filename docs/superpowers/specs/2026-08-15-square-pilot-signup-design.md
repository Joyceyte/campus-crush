# Square pilot signup — design

**Date:** 2026-08-15
**Status:** Approved, ready for implementation planning
**Supersedes:** Roadmap Phase 3 Stripe payment step (PAY-01/02/03); the
2026-08-03 "waitlist closed" decision

## Problem

Campus Crush is running a paid pilot at the University of Melbourne in semester
2, 2026: 100 students pay $5 to secure a spot, get matched, and go on a planned
food date at a partner venue. Signups close **20 August 2026**.

The site today is a marketing landing page with a Supabase-backed waitlist. It
has no accounts, no payments, and no pilot list. The planned auth-and-onboarding
milestone (roadmap Phases 1–4) is not built — Phase 1's SQL was never applied,
and Phase 2 has not been executed.

This design delivers a self-contained pilot signup that sits *in front of* that
milestone rather than depending on it: a student reads the announcement, fills a
short form, pays $5 through Square, and lands in a `pilot_signups` table with a
verified payment status. No login, no profile, no Google OAuth.

## Scope

**In scope**

1. Landing page copy and CTA changes
2. Founders' message pop-up (first visit only)
3. Join-the-pilot pop-up with the signup form
4. Square payment link creation
5. `/pilot/success` — verifies payment directly against Square and records it
6. Reconciliation script for payments the success page never saw
7. Confirmation email via Resend
8. Waitlist reopened as a newsletter (inline, not a modal)

**Out of scope**

- **Webhooks** — deliberately not built (see *Why no webhook*)
- SMS sending (numbers are banked; no provider is wired up)
- Google OAuth, profiles, onboarding, preferences, matching — Phases 1–4 stand
  unchanged and unbuilt
- Admin UI for refunds (issued manually in the Square dashboard)
- Enforced reservation/inventory logic (see *Closing rules*)

## Decisions

| Decision | Value | Rationale |
|---|---|---|
| Payment provider | Square | Replaces the planned Stripe SetupIntent |
| Price | $5 AUD, flat | Commitment filter, not revenue — ceiling is $500 |
| Founding-member exemption | Dropped | Everyone pays the same |
| Eligibility | `@student.unimelb.edu.au` only | Pilot venues and matching pool are UniMelb |
| Auth | None | No password stored; account links up later via email match |
| Link creation | Per-user, via Checkout API | Enables exact payment→student matching |
| Payment confirmation | Direct Square API read | Verified in spike; no webhook needed |
| Missed payments | Reconciliation sweep | Covers the closed-tab case |
| Closing rule | 20 Aug 2026 **or** 100 paid | Both are promised in copy |

### Why no password

The original spec asked for a password field. It was dropped because:

- Google OAuth (roadmap Phase 2) is the intended long-term auth. Password
  accounts created now would collide with it unless identity-linking is
  configured deliberately.
- Storing passwords means owning reset flows and a breach surface, for an
  account nobody can use until the product ships.
- It removes a field from the form, which helps conversion.

The outcome the password was meant to buy — "the account already exists when we
launch" — is delivered instead by `pilot_signups.claimed_by`: when Phase 2 ships
and a student signs in with Google, their paid pilot row is matched on email and
attached to their new account.

### Why no webhook

A webhook was in the original design as the source of truth. The sandbox spike
showed it isn't necessary: we store `square_order_id` when the link is minted,
and reading that order back from Square returns the payment status directly. The
success page can therefore confirm payment itself, synchronously, at the moment
the student arrives.

Dropping the webhook removes a public endpoint, HMAC signature verification (a
common source of subtle bugs), an idempotency ledger table, and an extra secret
to manage — on a five-day timeline, for ~100 transactions.

The one case a webhook covered and a direct read does not is a student who pays
and closes the tab before the redirect fires. That is handled by the
reconciliation sweep below, which is strictly simpler than a webhook and also
picks up refunds.

### Why the redirect alone can't be trusted

`/pilot/success` is guessable and directly visitable. It therefore never trusts
its own query string — it uses `ref` only to *find* the row, then asks Square
whether that order was actually paid. The URL cannot be used to fake a spot.

## User flow

```
Landing page
  │
  ├─ first visit ──> Founders' pop-up ──[Sign up]──┐
  │                                                │
  └─ [Join the pilot] ─────────────────────────────┤
                                                   ▼
                                        Join pop-up (form)
                                                   │  server action
                                                   ▼
                              insert pilot_signups (pending)
                              mint Square payment link
                              store order_id + link url
                                                   │
                                                   ▼
                                        Square hosted checkout
                                                   │
                                        redirect   ▼
                                          /pilot/success?ref=…
                                                   │
                                    GET Square order → payment COMPLETED?
                                                   │
                                     yes ──> mark paid, send email, "You're in!"
                                     no  ──> "confirming…", retry

              (separately, on a schedule)
              reconciliation sweep ──> pending rows → ask Square → mark paid
```

## Surfaces

### 1. Landing page

**Navbar** gains **How it works**, anchor-scrolling to the user-journey section.

**Hero** (`components/Hero.tsx`) left panel:

```
MEET YOUR / movie marathon        ← rotating phrase, unchanged
──────────────────────────────
PILOTING SEMESTER 2, 2026
UniMelb · 100 users

     [ Join the pilot → ]
   ✦ CLOSES 20 AUGUST

   Not at UniMelb? Get updates →   ← plain text link, no button styling
```

The countdown-from-100 animation (`useSignupCount` / `SIGNUP_GOAL` /
`displayedSpots`) is **removed from the hero**. It was a scarcity meter for
waitlist signups; leaving a live number under a "Join the pilot" button reads as
a count of paid spots, which it is not. The deadline occupies that visual slot
instead — same terracotta treatment, same urgency, and it cannot be misread.

`LaunchBanner`'s typed message ("…coming this winter") is rewritten for the
pilot.

After the closing rule trips, the hero swaps to a closed state and the CTA is
replaced by the newsletter.

**FinalCTA** becomes the newsletter home: an **inline** form (not a modal),
carrying the waitlist count as past-tense proof — *"217 students already get our
updates."* `WaitlistModal` is retired as a modal; its form and POST to
`/api/waitlist` are reused inline. This avoids a third competing pop-up.

### 2. Founders' pop-up

Fires **once per browser**, gated on a `localStorage` flag, after a short delay
so it doesn't slam the page on load. Copy per `specs/Home_page.md`. Styled as a
torn page taped into the scrapbook, consistent with the existing `.scrap-card` /
`.washi` treatment — it's a letter, not a dialog.

CTA **Sign up** closes it and opens the join pop-up directly.

Dismissible by close button, backdrop click, and `Esc`. Focus is trapped while
open and returned on close.

### 3. Join pop-up

| Field | Validation |
|---|---|
| Full name | required, trimmed, non-empty |
| UniMelb email | required, must end `@student.unimelb.edu.au`, lowercased |
| Phone | required, normalised to E.164 (`+614…`) |
| ☐ I confirm I am over the age of 18 | required |

Under the phone field: *"We'll text you once, when we launch."* Australia's Spam
Act expects consent for commercial messages, and it makes the ask feel
considerate.

A non-UniMelb email gets a friendly rejection that offers the newsletter rather
than a dead end.

Submission runs a **Server Action**, so the Square access token never reaches
the browser.

### 4. `/pilot/success`

Server component. Reads `?ref=<pilot_signups.id>`, loads the row, and:

- Row already `paid` → render "You're in!" immediately.
- Row `pending` → `GET /v2/orders/{square_order_id}` and inspect the attached
  payment's status:
  - `COMPLETED` → update the row to `paid` (set `paid_at`, `square_payment_id`,
    `amount_cents`), send the confirmation email, render "You're in!".
  - anything else → render "Confirming your payment…" with a light client-side
    retry.
- Unknown ref → generic "we couldn't find that signup" with a contact link.

**Concurrency guard.** Two near-simultaneous loads could both try to mark paid
and send email. The update must be conditional so only one wins:

```sql
update public.pilot_signups
   set payment_status = 'paid', paid_at = now(), …,
       confirmation_email_sent_at = now()
 where id = $1 and confirmation_email_sent_at is null
returning id;
```

Zero rows returned means another request already handled it — render the success
state, send nothing.

### 5. Reconciliation sweep

A script (`scripts/reconcile-pilot-payments.ts`, runnable via `npm run`) that:

1. Selects rows where `payment_status = 'pending'` and `square_order_id` is not
   null.
2. Reads each order from Square.
3. Marks `paid` (sending the confirmation email through the same guarded update)
   or `failed` as appropriate.
4. Also flips rows to `refunded` where Square reports a completed refund.

Run manually at least daily until the 20th, and once after close. Can be
promoted to a Vercel cron later; not required for the pilot.

### 6. Confirmation email

Content per `specs/Home_page.md` ("What is the Pilot?", matching criteria,
venues, feedback form, open-mind caveat, refund promise). Styled to match the
existing waitlist welcome email (parchment, Jersey 25 heading, terracotta
accents, inline styles and tables).

Sent from whichever path first observes the completed payment — success page or
reconciliation sweep — guarded by `confirmation_email_sent_at` so it can only go
once. A send failure is logged and never fails the request; the payment is
already recorded.

## Data model

One new table, shipped as a `.sql` file in `supabase/` for manual execution,
matching the existing pattern.

```sql
create table if not exists public.pilot_signups (
  id                        uuid primary key default gen_random_uuid(),
  full_name                 text not null,
  email                     text not null unique,   -- lowercased UniMelb address
  phone                     text not null,          -- E.164, e.g. +61412345678
  university                text,                   -- derived from email domain
  over_18_confirmed_at      timestamptz not null,

  payment_status            text not null default 'pending'
                              check (payment_status in
                                ('pending','paid','failed','refunded')),
  square_payment_link_id    text,
  square_payment_link_url   text,                   -- for abandoned-cart nudges
  square_order_id           text,                   -- the reconciliation key
  square_payment_id         text,
  amount_cents              int,
  currency                  text not null default 'AUD',
  paid_at                   timestamptz,
  refunded_at               timestamptz,
  refund_amount_cents       int,

  confirmation_email_sent_at timestamptz,

  claimed_by                uuid references auth.users(id), -- null until Phase 2
  claimed_at                timestamptz,

  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

create index on public.pilot_signups (payment_status);
create index on public.pilot_signups (square_order_id);
```

**Design notes**

- `over_18_confirmed_at` is a timestamp, not a boolean — a checkbox is a legal
  claim and the time it was made is part of the record.
- `payment_status` is a constrained enum rather than a `paid boolean`, because
  `failed` and `refunded` are states you will actually hit.
- `square_order_id` is stored at link-creation time and is what both the success
  page and the sweep use to ask Square about payment. Without it, a pending row
  is unrecoverable.
- No `auth.users` foreign key on `id` — there are no accounts yet. `claimed_by`
  is the forward link.
- The `square_webhook_events` ledger from the earlier draft is **dropped** along
  with the webhook.

**RLS.** RLS enabled with **no public policies**. Nothing here is readable by an
anonymous or authenticated browser client. All access is server-side using the
**service-role** key (already present in `.env.local` as
`SUPABASE_SERVICE_ROLE_KEY`).

## Square integration

**Creating the link** (server action, after the row insert):

- Order `reference_id` = `pilot_signups.id`.
- Idempotency key = `pilot_signups.id`, so a double-click cannot mint two links.
- `pre_populated_data`: buyer email and phone.
- `checkout_options.redirect_url` = `{SITE_URL}/pilot/success?ref={id}`.
- Line item: "Campus Crush Pilot — Semester 2, 2026", $5.00 AUD.
- Persist `payment_link.id`, `payment_link.url`, and `payment_link.order_id`.

**Reading payment status** — `GET /v2/orders/{order_id}`, then follow
`order.tenders[0].payment_id` to `GET /v2/payments/{payment_id}` and check
`payment.status`.

### Verified against the sandbox (2026-08-15)

A throwaway probe against the live sandbox account confirmed:

- Account is **AU / AUD**, location `L937E8WP1HVDZ`, active.
- `reference_id` set on the payment link's order **round-trips intact**.
- A completed A$5.00 payment attaches to the order, and
  `payment.order_id` → `order.reference_id` resolves back to our UUID.

Three findings that constrain the implementation:

1. **Order state is not the payment signal.** After a completed payment the
   order sat at `state = OPEN`, not `COMPLETED` — Square's order state tracks
   fulfilment, not money. Read the attached payment's `status`. Reading order
   state would mark nobody paid.
2. **Buyer email came back empty**, despite `pre_populated_data.buyer_email`
   being set. Square does not guarantee an email on the payment object.
   Email-based matching would have failed on this very transaction.
3. **The direct read works**, which is what makes dropping the webhook viable.

> **Verify before implementing:** the Square Node SDK surface has changed across
> major versions (older `Client` + `checkoutApi.createPaymentLink`, newer
> `SquareClient` + `checkout.paymentLinks.create`). The spike used raw `fetch`
> against the REST API with `Square-Version: 2025-06-18`, which worked. Consider
> keeping raw `fetch` rather than adding the SDK dependency for four endpoints.

## Closing rules

Enforced **server-side in the action**, not by hiding a button:

- Now past **2026-08-20** (Melbourne time) → closed.
- `count(*) where payment_status = 'paid'` ≥ **100** → closed.

A closed form returns a friendly message and offers the newsletter. A handful of
in-flight payments can overshoot 100; the refund promise in the confirmation
email covers exactly that case. Real reservation logic is deliberately not built
— the ceiling is $500 and the deadline is five days away.

## Edge cases

| Case | Behaviour |
|---|---|
| Abandoned payment | Row stays `pending`; `square_payment_link_url` retained so a nudge email can be sent before the 20th |
| Paid, closed tab before redirect | Reconciliation sweep marks them paid and sends the email |
| Returning email, `paid` | Redirect straight to `/pilot/success` |
| Returning email, `pending` | Reuse the stored link rather than erroring on the unique constraint |
| Success page loaded twice | Conditional update means only one request marks paid / sends email |
| Direct visit to `/pilot/success` | `ref` only finds the row; Square is the authority on payment |
| Non-UniMelb email | Rejected with an offer of the newsletter |
| Refund issued | Manual in Square; sweep flips the row to `refunded` |
| Square API down at redirect | Row stays `pending`, page shows "confirming…"; sweep resolves it later |

## Security

- Square access token is a server-only environment variable — never
  `NEXT_PUBLIC_`.
- Service-role Supabase key used only in server actions, the success page, and
  the reconciliation script.
- No passwords stored.
- `/pilot/success` treats `ref` as a lookup key only, never as proof of payment.
- Phone numbers are personal data: the privacy policy at `/privacy` needs a line
  covering collection and use (launch notification only).

## Manual setup

1. ✅ **Square account** — verified 2026-08-15: AU, AUD, sandbox token working.
2. Production Square credentials (the spike used sandbox).
3. Environment variables in Vercel and `.env.local`:
   `SQUARE_ACCESS_TOKEN`, `SQUARE_LOCATION_ID`, `SQUARE_ENVIRONMENT`,
   `NEXT_PUBLIC_SITE_URL`. (`SUPABASE_SERVICE_ROLE_KEY` already exists.)
   Sandbox values currently live under `SANDBOX_*` names.
4. Run `supabase/pilot-signups.sql` in the Supabase SQL editor.
5. End-to-end test in Square sandbox before switching to production keys.

## Risks

**The deadline is the binding risk.** It is 15 August; signups close on the
20th.

**The waitlist welcome email is now inaccurate.** `app/api/waitlist/route.ts`
hardcodes *"Congrats on being one of the first 100 users"* and *"one month of
free premium membership."* Signup #218 receives that today. Reopening the form
as a newsletter requires rewriting that copy first — it promises a perk that no
longer exists, in writing.

**The founding-member promise needs an out-of-band answer.** The first ~80
waitlist signups were told they'd get a free month. The team should decide what
to tell them.

**Square's refund fee behaviour is unconfirmed.** The confirmation email
promises a *full* refund; check whether Square returns its processing fee.

**The sweep is manual.** If nobody runs it, closed-tab payers stay `pending`.
Set a reminder, or promote it to a Vercel cron.

## Superseded decisions

Both need recording in `.planning/` so a later planning pass doesn't revert them:

1. **2026-08-03 "waitlist closed"** — the waitlist reopens as a newsletter, and
   landing CTAs point at the paid pilot flow, not `/login`.
2. **Roadmap Phase 3 payment step** — Stripe SetupIntent is replaced by Square.
   The `stripe_customer_id` / `stripe_payment_method_id` columns in
   `supabase/profiles.sql` are now dead and should be dropped or renamed when
   that phase is replanned.

## Open items

- Third partner venue is still "another mystery venue" in the confirmation email
- No SMS provider chosen; numbers are banked only
- Feedback form on the success page — destination not yet specified
