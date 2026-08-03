<!-- GSD:project-start source:PROJECT.md -->

## Project

**Campus Crush — User Accounts & Onboarding Profiles**

Campus Crush is a food-date matching pilot for Melbourne university students (UniMelb, Monash, Deakin, RMIT, La Trobe), currently a Next.js landing site with a Supabase-backed waitlist at campus-crush.org. This milestone adds real user accounts: students sign in with their university Google account, complete an onboarding profile (face photo, demographics, interests, dating intention, meal availability) plus match preferences, and everything is saved to their own row in a dedicated Supabase profiles table.

**Core Value:** A student can sign in with Google and submit a complete, safety-reviewed dating profile that gives the team everything needed to match them for a food date during the pilot.

### Constraints

- **Tech stack**: Next.js App Router + Supabase (Auth, Storage, Postgres) — already in use, no new backend infrastructure
- **Database access**: SQL migrations delivered as files in `supabase/` for manual execution — no direct DB access from this environment
- **Security**: Photos bucket must be private; profiles table must have RLS so users can only read/write their own row
- **Safety**: Face-photo requirement and warning copy are mandatory in the onboarding form
- **Compatibility**: Must not disturb the existing landing page, waitlist, or partnerships features

<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->

## Technology Stack

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `@supabase/ssr` | `^0.12.4` | Cookie-based Supabase client for Next.js SSR (Server Components, Route Handlers, Server Actions, Middleware) | This **is** the modern, actively-maintained way to use Supabase Auth with Next.js App Router. It replaces the old `@supabase/auth-helpers-*` family, which is deprecated on the npm registry (`"deprecated": "Package no longer supported"`, dist-tag latest `0.15.0`). Peer-depends on `@supabase/supabase-js@^2.111.0`. |
| `@supabase/supabase-js` | `^2.111.0` (project already has `^2.108.2`, caret range is compatible — bump on next `npm install`) | Core Supabase client (`auth`, `storage`, `postgrest`) | Already a project dependency; no change in role, just needs to be current enough to satisfy `@supabase/ssr`'s peer dependency. |
| Next.js Middleware (`middleware.ts`) | n/a (built into Next 16) | Refreshes the Supabase session cookie on every request | Server Components cannot mutate cookies, so token refresh **must** happen in middleware. Skipping this is the #1 cause of "users randomly logged out" bug reports across every guide reviewed. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| None required beyond the above | — | — | Native `<form>` + Server Actions are sufficient for the onboarding form (multi-step state can live in a client component with `useState`/search params — no need for a form library at this scale). Native `<input type="file">` + Server Action / Route Handler upload is sufficient for the photo upload — no need for a dedicated uploader library (e.g. Uppy) for a single face photo. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Supabase SQL Editor (dashboard) | Run all schema/RLS/storage-policy SQL | This environment has no direct DB access — every schema change ships as a `.sql` file in `supabase/` (matching the existing `founding-member.sql` / `venues.sql` pattern) for the user to paste into the SQL editor. |
| Supabase Dashboard → Authentication → Providers | Configure Google OAuth client ID/secret + redirect URLs | Cannot be done from code; user must do this manually (already called out in PROJECT.md). |
| Supabase Dashboard → Authentication → Hooks | Configure the "Before User Created" hook (see below) | Points at a Postgres function shipped in a `supabase/*.sql` file — the function itself is code-reviewable, only the hook *wiring* is a manual dashboard step. |

## Installation

# Core

# @supabase/supabase-js is already installed; npm will resolve it to a version

# satisfying @supabase/ssr's peer dependency (^2.111.0) automatically since the

# existing "^2.108.2" range covers it — no package.json edit strictly required,

# but running `npm install` (or `npm update @supabase/supabase-js`) after adding

# @supabase/ssr is worth doing explicitly so the lockfile records the bump.

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| `@supabase/ssr` | `@supabase/auth-helpers-nextjs` | Never for new code — deprecated on npm, official Supabase docs point migrators away from it. Only relevant if this were a legacy codebase already using it. |
| Post-signin domain check + "Before User Created" Postgres hook (defense in depth) | Google Workspace domain restriction (`hd` param) in OAuth config | Not viable here — `hd` only supports a **single** Google Workspace domain, and this project needs five separate university domains (UniMelb, Monash, Deakin, RMIT, La Trobe are not all one Workspace org). Confirmed by PROJECT.md's own constraint notes. |
| Private bucket + signed URLs for reads | Public bucket with obscure/unguessable paths | Never for face photos — "security by obscurity" on a dating app's identity photos is a real privacy/safety risk (mis-scraping, URL leakage). Private + RLS + signed URL is the only acceptable pattern here. |
| Native `<input type="file">` + Server Action upload | Uppy / react-dropzone / Supabase's `Dropzone` UI kit | Only if/when multi-photo galleries or drag-and-drop polish become a requirement — out of scope per PROJECT.md (single face photo, MVP pilot). |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `@supabase/auth-helpers-nextjs` / `-react` / `-shared` | Deprecated, registry-flagged "no longer supported," incompatible session-cookie shape if mixed with `@supabase/ssr` in the same app | `@supabase/ssr` |
| `supabase.auth.getSession()` for authorization decisions in Server Components/middleware/Route Handlers | Reads an **unverified** cookie value — does not confirm the JWT with the Auth server, so it can be spoofed/stale | `supabase.auth.getUser()` — round-trips to Supabase Auth to validate the token before you trust it |
| Client-only email-domain check (JS `if` before calling `signInWithOAuth`, or checking the domain only in a client component after redirect) | Trivially bypassable — client-side checks are not enforcement, and PROJECT.md explicitly requires server-side enforcement | Postgres "Before User Created" Auth Hook (rejects account creation server-side, pre-insert) **plus** a server-side check in middleware/layout as a second layer for any user created before the hook was wired up |
| Public Supabase Storage bucket for profile/face photos | Photos are inherently private/sensitive; a public bucket means anyone with the URL (which can leak via referrers, screenshots, logs) can view them | Private bucket + owner-scoped RLS policies + short-lived `createSignedUrl()` for authorized reads (team's manual review) |
| Writing raw `auth.uid() = id` (unwrapped) in every RLS policy | Postgres re-evaluates the function **per row** instead of once per statement — real performance cost as `profiles` grows, and this is the exact pattern Supabase's own troubleshooting guide flags | `(select auth.uid()) = id` — wraps the call so the planner caches it once (`initPlan`) |
| A generic multi-tenant/"users" table conflated with `profiles` | PROJECT.md explicitly requires a **dedicated** `profiles` table, separate from `waitlist`/`venues` | New `public.profiles` table keyed on `auth.users.id`, its own RLS policy set |

## Stack Patterns by Variant

- Reject in the Postgres "Before User Created" hook (`http_code: 403`, custom message) so no `auth.users` row is ever created.
- Because this is the only server-side point that runs before persistence for *every* signup path (including OAuth) — it's stronger than "create then delete/sign-out," which leaves a race window and orphaned data.
- Gate in a server component/layout: fetch `profiles` row server-side (via `getUser()` + RLS-scoped `select`), and either `redirect()` to `/onboarding` (no row / incomplete) or `/profile` (confirmation/edit view — row exists and is marked complete).
- Because this decision requires trusted server-side data (the client cannot be trusted to self-report "I finished onboarding"), and Next.js Server Components make this a single round trip with no client-side flash of the wrong screen.
- Do the `supabase.storage.from('photos').upload(...)` call inside a Server Action or Route Handler using the **server** client (cookie-scoped, so the user's own JWT is attached and RLS applies), not the browser client directly to a public endpoint.
- Because RLS on `storage.objects` needs `auth.uid()` to resolve correctly, and running the upload server-side keeps the storage policy the single source of truth (no client-trusted metadata).

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `@supabase/ssr@0.12.4` | `@supabase/supabase-js@^2.111.0` | Peer dependency declared in the package; project's current `^2.108.2` range is satisfied but should be bumped in the lockfile when `@supabase/ssr` is added. |
| `@supabase/ssr` (any current 0.x) | Next.js 15–16 App Router | Requires `await cookies()` (Next made `cookies()`/`headers()` async starting Next 15, carried into Next 16) — the server client factory must be an async function that awaits `cookies()` before building `getAll`/`setAll` handlers. Confirmed via Supabase's own "Bootstrap Next.js v16 app with Supabase Auth" guide. |
| `@supabase/ssr` middleware client | Next.js `middleware.ts` (Edge runtime) | Needs its own `createServerClient` instance built from the middleware's `request`/`response` cookies (distinct from the Server Component client) — three client instances total: browser, server (RSC/Actions/Route Handlers), middleware. |

## Sources

- https://supabase.com/docs/guides/auth/server-side/nextjs — official Setting up Server-Side Auth for Next.js (MEDIUM confidence — reached via WebSearch, not direct MCP docs fetch, but content cross-checked against multiple independent guides and the registry data below)
- https://supabase.com/docs/guides/troubleshooting/how-to-migrate-from-supabase-auth-helpers-to-ssr-package-5NRunM — official migration guide off `auth-helpers` (MEDIUM)
- https://registry.npmjs.org/@supabase/ssr (direct registry query) — version `0.12.4`, peer dep `@supabase/supabase-js@^2.111.0` (HIGH confidence — primary source, not a summarized/secondary page)
- https://registry.npmjs.org/@supabase/supabase-js (direct registry query) — latest `2.111.0` (HIGH)
- https://registry.npmjs.org/@supabase/auth-helpers-nextjs (direct registry query) — latest dist-tag `0.15.0` flagged `deprecated: "Package no longer supported."` (HIGH — primary source)
- https://supabase.com/docs/guides/auth/auth-hooks/before-user-created-hook — official Before User Created hook docs, incl. Postgres function example (MEDIUM)
- https://supabase.com/docs/guides/storage/security/access-control — official Storage RLS/access-control docs (MEDIUM)
- https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv — official RLS performance guide, `(select auth.uid())` pattern (MEDIUM)
- https://supabase.com/docs/guides/getting-started/ai-prompts/nextjs-supabase-auth — official "Bootstrap Next.js v16 app with Supabase Auth" AI prompt guide, confirms Next 16 async-cookies compatibility (MEDIUM)
- Cross-checked community sources (dev.to, Medium, individual blogs) for middleware pitfalls and Route Handler callback patterns — consistent across ≥3 independent sources, treated as corroborating rather than primary

<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
