# Phase 1: Supabase Auth Foundation - Pattern Map

**Mapped:** 2026-08-03
**Files analyzed:** 6
**Analogs found:** 3 exact/role-match / 6 (3 have no analog — greenfield SDK boilerplate, use RESEARCH.md code examples instead)

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|--------------------|------|-----------|-----------------|----------------|
| `lib/supabase/client.ts` | config/provider | request-response | `lib/supabase.ts` | role-match (same purpose: browser Supabase client factory, different SDK entry point) |
| `lib/supabase/server.ts` | config/provider | request-response | `lib/supabase.ts` | role-match (same purpose, cookie-aware variant — no analog for cookie plumbing) |
| `lib/supabase/middleware.ts` | middleware | request-response | none | no analog — greenfield, no middleware exists in repo |
| `middleware.ts` (repo root) | middleware | request-response | none | no analog — greenfield, first middleware file in repo |
| `supabase/profiles.sql` | migration | CRUD | `supabase/venues.sql` | exact (table + RLS + storage bucket, same file shape) |
| `supabase/photos-storage.sql` | migration | file-I/O | `supabase/venues.sql` | exact (storage bucket + RLS section of venues.sql is the direct analog) |

## Pattern Assignments

### `lib/supabase/client.ts` (config/provider, request-response)

**Analog:** `lib/supabase.ts` (full file, 6 lines)

**Full existing file** (`lib/supabase.ts`):
```typescript
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

**What to carry forward:**
- Same env var names: `NEXT_PUBLIC_SUPABASE_URL!`, `NEXT_PUBLIC_SUPABASE_ANON_KEY!` (non-null assertion style, matches existing convention).
- **Do not touch `lib/supabase.ts`** — it stays as-is for the waitlist. `lib/supabase/client.ts` is a new, separate file (note the directory-vs-file naming: `lib/supabase.ts` file and `lib/supabase/` directory coexist — verify no naming collision on case-insensitive filesystems before creating).
- New pattern (no existing analog in repo, use RESEARCH.md Pattern 1 verbatim): swap `createClient` from `@supabase/supabase-js` for `createBrowserClient` from `@supabase/ssr`, same two env vars, wrapped in an exported `createClient()` function (not a top-level singleton like the old file) so it can be called per-component per official Supabase SSR convention.

### `lib/supabase/server.ts` (config/provider, request-response)

**No repo analog** — this requires cookie-aware async client creation which nothing in the codebase does today (no Server Actions/Route Handlers use Supabase yet).

**Use RESEARCH.md Pattern 1 (`lib/supabase/server.ts` example)** verbatim — key details to preserve:
- Must be an `async function createClient()` that does `const cookieStore = await cookies()` (Next 16 async cookies requirement).
- `setAll` wrapped in try/catch with a comment explaining why errors are swallowed (middleware handles refresh).
- Same two env vars as `lib/supabase.ts`.

### `lib/supabase/middleware.ts` + root `middleware.ts` (middleware, request-response)

**No repo analog** — greenfield, first middleware file in the project.

**Use RESEARCH.md Pattern 1 (`lib/supabase/middleware.ts` + `middleware.ts` examples)** verbatim:
- `updateSession(request)` helper builds a `createServerClient` from `request.cookies`, mutates both `request.cookies` and a fresh `NextResponse.next({ request })`.
- Must call `await supabase.auth.getUser()` (not `getSession()`) — this line is what actually triggers the cookie refresh; comment in the source explains this, keep it.
- Root `middleware.ts` matcher excludes `_next/static`, `_next/image`, `favicon.ico`, and image extensions — reuse this matcher regex verbatim since it's the standard exclusion list and this repo's `public/` directory has several `.png` assets (`partnership-inspo.png`, `scrap-*.png`, etc.) that should not be routed through middleware.

### `supabase/profiles.sql` (migration, CRUD)

**Analog:** `supabase/venues.sql` (full file, 45 lines) — closest existing table+RLS migration in the repo.

**Header comment pattern** (`supabase/venues.sql` lines 1-6):
```sql
-- Partnered venues showcased in the Restaurant Partnerships section.
-- Run this in the campus-crush Supabase project's SQL editor.
--
-- photo_url: venue photo shown inside the polaroid frame
-- ...
```
Carry forward: explanatory header comment + "Run this in the Supabase SQL editor" instruction line — every new `.sql` file in this repo opens this way (also confirmed in `founding-member.sql` lines 1-7).

**Table creation pattern** (`supabase/venues.sql` lines 8-18):
```sql
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
```
Carry forward: `create table if not exists public.<name>` (idempotent, matches project convention), `not null default` for booleans/timestamps, `timestamptz not null default now()` for `created_at`.

**Deviation required for `profiles.sql`:** `id` must be `uuid primary key references auth.users(id) on delete cascade` (not `gen_random_uuid()`) — this is the key structural difference from `venues.sql`, per DATA-01 and RESEARCH.md's full DDL. Use RESEARCH.md's complete `profiles.sql` code block as the source of truth for the wide schema (photo_path, age, sex, height_cm, ethnicity, interests text[], dating_intention, meal_availability text[], available_dates date[], pref_* columns, updated_at).

**RLS pattern** (`supabase/venues.sql` lines 20-24):
```sql
alter table public.venues enable row level security;

-- The site reads venues with the anon key; only active rows are visible.
create policy "Public can read active venues"
  on public.venues for select
  to anon
  using (is_active);
```
Carry forward: `alter table ... enable row level security` immediately after table creation, named policy strings in plain English (`"Public can read active venues"` style → `"Users can view own profile"`, `"Users can insert own profile"`, `"Users can update own profile"`), one-line explanatory comment above each policy block.

**Deviation required:** `venues.sql` policy targets `to anon` with a boolean predicate (public read); `profiles.sql` policies target `to authenticated` with `(select auth.uid()) = id` (owner-only, per RESEARCH.md Pattern 2 and DATA-02). Do not copy the `anon`/`is_active` predicate — it's the wrong access model for a private per-user table.

### `supabase/photos-storage.sql` (migration, file-I/O)

**Analog:** `supabase/venues.sql` lines 26-29 (storage bucket section)

**Bucket creation pattern** (`supabase/venues.sql` lines 26-29):
```sql
-- Public bucket for venue photos + logos (skip if you host images elsewhere).
insert into storage.buckets (id, name, public)
values ('venue-assets', 'venue-assets', true)
on conflict (id) do nothing;
```
Carry forward: `insert into storage.buckets (id, name, public) values (...) on conflict (id) do nothing` shape, explanatory comment above.

**Critical deviation (security-critical):** `venues.sql` sets `public` to `true` (venue assets are meant to be publicly viewable). `photos-storage.sql` MUST set `public` to `false` — per DATA-03 and CLAUDE.md's explicit "never public bucket for face photos" rule. Do not pattern-match the `true` value from venues.sql; only the SQL shape (insert/on-conflict) should be copied.

**No existing storage RLS analog in repo** — `venues.sql` has no `storage.objects` policies (its bucket is fully public, needs none). Use RESEARCH.md Pattern 3 verbatim for all four storage policies (`insert`, `select`, `update`, `delete`), each using `(select auth.uid())::text = (storage.foldername(name))[1]` and `bucket_id = 'photos'`.

## Shared Patterns

### SQL file delivery convention
**Source:** `supabase/founding-member.sql`, `supabase/venues.sql` (whole-file pattern)
**Apply to:** `supabase/profiles.sql`, `supabase/photos-storage.sql`
- Opens with a comment block: one-line file purpose + "Run this in the Supabase SQL editor" instruction, plus any column/semantic notes.
- Uses `if not exists` / `on conflict (id) do nothing` everywhere for idempotent re-runs (this environment cannot execute SQL directly — the user re-runs these files manually, so idempotency matters more than in a CLI-migration workflow).
- Named policies as human-readable strings (e.g. `"Users can view own profile"`), not auto-generated names.

### Env var naming
**Source:** `lib/supabase.ts` lines 4-5
**Apply to:** `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/middleware.ts`
```typescript
process.env.NEXT_PUBLIC_SUPABASE_URL!
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
```
All three new SSR client files must reuse these exact two env var names (already configured in `.env.local`/Vercel per CONTEXT.md) — no new env vars needed this phase.

### getUser() over getSession()
**Source:** RESEARCH.md Pattern 1 (`lib/supabase/middleware.ts` example) — no repo analog, this is a new project-wide rule starting this phase.
**Apply to:** `lib/supabase/middleware.ts`, and every future Server Component/Action/Route Handler that checks auth (Phase 2+).
```typescript
// IMPORTANT: do not remove — getUser() re-validates the token
// and triggers the refresh that populates supabaseResponse's cookies.
await supabase.auth.getUser();
```

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `lib/supabase/middleware.ts` | middleware | request-response | No middleware exists anywhere in the repo yet (greenfield) — use RESEARCH.md Pattern 1 verbatim |
| `middleware.ts` (repo root) | middleware | request-response | Same — first middleware file in the project |
| `lib/supabase/server.ts` | config/provider | request-response | No cookie-aware/async Supabase client exists; `lib/supabase.ts` is a synchronous plain client with no cookie handling — use RESEARCH.md Pattern 1 verbatim |

## Metadata

**Analog search scope:** `lib/`, `supabase/` (entire repo — small project, full directories scanned)
**Files scanned:** `lib/supabase.ts`, `lib/blog.ts`, `lib/resend.ts`, `lib/useSignupCount.ts`, `supabase/founding-member.sql`, `supabase/venues.sql`, `package.json` (no `middleware.ts` found in repo root)
**Pattern extraction date:** 2026-08-03
