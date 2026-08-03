# Architecture Research

**Domain:** Supabase Auth (Google OAuth) + onboarding profile + private photo storage, bolted onto an existing Next.js 16 App Router marketing site
**Researched:** 2026-08-03
**Confidence:** MEDIUM (Supabase's own `@supabase/ssr` App Router pattern is well-documented and stable; project-specific wiring decisions below are opinionated recommendations, not verified against this exact codebase running)

## Standard Architecture

### System Overview

```
┌───────────────────────────────────────────────────────────────────────┐
│  Browser                                                               │
│  ┌──────────────┐   ┌────────────────────┐   ┌──────────────────┐    │
│  │ Sign-in button│   │ Onboarding form     │   │ Profile/edit view │    │
│  │ (Client Comp) │   │ (Client Comp fields)│   │ (Server + Client) │    │
│  └──────┬───────┘   └──────────┬──────────┘   └─────────┬─────────┘    │
├─────────┼──────────────────────┼────────────────────────┼─────────────┤
│         │            middleware.ts (session refresh +    │             │
│         │            top-level signed-in gate, edge)      │             │
├─────────┼──────────────────────┼────────────────────────┼─────────────┤
│         ▼                      ▼                         ▼             │
│  /auth/callback          Server Actions               Server Component │
│  (Route Handler,         (app/onboarding/actions.ts,   data fetch     │
│  PKCE code exchange +    profile upsert + photo         (getUser() +  │
│  domain allowlist)       upload)                        profile row)  │
├───────────────────────────────────────────────────────────────────────┤
│  lib/supabase-browser.ts │ lib/supabase-server.ts │ lib/supabase-      │
│  (createBrowserClient)   │ (createServerClient,    │ middleware.ts     │
│                          │  cookies() from          │ (updateSession    │
│                          │  next/headers)           │  helper)          │
├───────────────────────────────────────────────────────────────────────┤
│  Supabase                                                              │
│  ┌───────────┐  ┌───────────────┐  ┌────────────────────────────┐    │
│  │ auth.users │  │ public.profiles│  │ storage: profile-photos    │    │
│  │ (Google    │  │ (RLS: own row  │  │ bucket (private, RLS on    │    │
│  │  OAuth)    │  │  only)         │  │ storage.objects, per-user  │    │
│  └───────────┘  └───────────────┘  │  folder prefix)             │    │
│                                     └────────────────────────────┘    │
└───────────────────────────────────────────────────────────────────────┘
```

The existing marketing surface (`/`, `/blog`, `/contact`, `/privacy`, `app/api/waitlist`, `app/api/venues`) is untouched — it keeps using the existing `lib/supabase.ts` anon-key singleton. Everything above is new and additive.

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|-------------------------|
| `lib/supabase-browser.ts` | Auth-aware client for Client Components (sign-in button, interactive form fields, file-preview) | `createBrowserClient` from `@supabase/ssr`, reads/writes cookies via document.cookie under the hood |
| `lib/supabase-server.ts` | Auth-aware client for Server Components / Server Actions / Route Handlers | `createServerClient` from `@supabase/ssr`, built per-request against `cookies()` from `next/headers` |
| `lib/supabase-middleware.ts` | `updateSession(request)` helper — refreshes the auth cookie before it expires | `createServerClient` bound to `NextRequest`/`NextResponse` cookie adapters, called once per request from `middleware.ts` |
| `middleware.ts` (project root) | Cheap, edge-runtime session refresh + coarse "must be signed in" redirect for `/onboarding` and `/profile` | Calls `updateSession`, then `supabase.auth.getUser()`; redirects to sign-in if absent. Does **not** query the `profiles` table (too expensive to run on every request) |
| `app/auth/callback/route.ts` | Single enforcement point for the PKCE code exchange **and** the university-domain allowlist | `GET` Route Handler: `exchangeCodeForSession(code)` → check `user.email` against the same `UNI_DOMAINS` list used by the waitlist route → if it fails, `signOut()` and redirect to a friendly `/auth/not-eligible` page; if it passes, redirect to `/profile` (which itself bounces to `/onboarding` if incomplete — see Routing States) |
| `app/onboarding/actions.ts` | Server Action(s) that own all writes to `profiles` and the photo upload | Re-derives the user server-side via `getUser()` (never trusts a client-submitted id), validates form fields, uploads the photo to Storage, upserts the `profiles` row — one transaction-shaped unit of work |
| `app/onboarding/page.tsx` + `app/profile/page.tsx` | Route between "needs onboarding" and "has a profile" states | Server Components: fetch the caller's `profiles` row, `redirect()` to the other route if the state doesn't match this page |
| `supabase/profiles.sql`, `supabase/profile-photos-storage.sql` | Schema + RLS as manually-run SQL files (matches existing `founding-member.sql` / `venues.sql` pattern) | `CREATE TABLE profiles`, RLS policies scoped to `auth.uid()`, bucket creation + `storage.objects` policies scoped to the user's folder prefix |

## Recommended Project Structure

```
app/
├── page.tsx                    # existing marketing home — untouched
├── blog/, contact/, privacy/   # existing — untouched
├── api/
│   ├── waitlist/route.ts       # existing — untouched
│   └── venues/route.ts         # existing — untouched
├── auth/
│   └── callback/route.ts       # NEW — PKCE exchange + domain allowlist (single enforcement point)
├── (protected)/                # NEW route group — shared auth re-check, no shared UI chrome needed
│   ├── layout.tsx              # calls getUser() again (defense in depth beyond middleware); redirects to sign-in if absent
│   ├── onboarding/
│   │   ├── page.tsx            # Server Component: redirects to /profile if profile already complete
│   │   ├── actions.ts          # Server Action(s): validate, upload photo, upsert profiles row
│   │   └── OnboardingForm.tsx  # Client Component: controlled fields, file input, calls the action via <form action={...}>
│   └── profile/
│       └── page.tsx            # Server Component: confirmation view + "edit" mode reusing OnboardingForm, prefilled + signed photo URL
lib/
├── supabase.ts                 # existing anon-key singleton — untouched, still used by waitlist/venues
├── supabase-browser.ts         # NEW — createBrowserClient
├── supabase-server.ts          # NEW — createServerClient factory
├── supabase-middleware.ts      # NEW — updateSession(request) helper
└── uni-domains.ts              # NEW — extract UNI_DOMAINS from app/api/waitlist/route.ts into a shared module
middleware.ts                   # NEW — project root
supabase/
├── founding-member.sql, venues.sql   # existing
├── profiles.sql                      # NEW — table + RLS policies
└── profile-photos-storage.sql        # NEW — bucket + storage.objects policies
```

### Structure Rationale

- **`lib/supabase-browser.ts` / `-server.ts` / `-middleware.ts` as flat files, not a `lib/supabase/` folder:** `lib/supabase.ts` already exists as a file. Introducing a `lib/supabase/` directory alongside it creates an ambiguous module specifier (`@/lib/supabase` could resolve to either the file or `index.ts` in the folder). Flat, distinctly-named files sidestep this without touching the working waitlist/venues code — satisfies the "must not disturb existing features" constraint for free.
- **`app/(protected)/` route group:** groups `onboarding` and `profile` under one `layout.tsx` that re-verifies `getUser()`, so the auth check lives in exactly one place for both pages instead of being duplicated per-page. Route groups don't affect the URL, so `/onboarding` and `/profile` stay unprefixed.
- **`app/auth/callback/` outside the route group:** it's a Route Handler, not a page, and needs to run *before* the user has a valid session (it's what creates the session) — it can't live under a layout that assumes an already-authenticated user.
- **`lib/uni-domains.ts`:** the domain allowlist currently lives inline in `app/api/waitlist/route.ts`. It now needs to be checked in two places (waitlist signup, OAuth callback) — extract it once rather than let the two lists drift.

## Architectural Patterns

### Pattern 1: Middleware refreshes sessions; it is not the authorization boundary

**What:** `middleware.ts` calls `updateSession(request)` on (almost) every request to keep the auth cookie fresh, and does one cheap `getUser()` check to redirect signed-out users away from `/onboarding` and `/profile`. It does **not** query the `profiles` table and is not trusted as the sole gate — every Server Component/Server Action under `(protected)/` re-checks `getUser()` before reading or writing anything.
**When to use:** Always, for any App Router + Supabase Auth setup. This is Supabase's own documented pattern.
**Trade-offs:** Slightly more boilerplate (auth checked twice) in exchange for correctness — middleware can be misconfigured (wrong `matcher`) or skipped for certain request types, so it must never be the only thing standing between an anonymous request and a write.

**Example:**
```typescript
// middleware.ts
import { updateSession } from "@/lib/supabase-middleware";

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const protectedPaths = ["/onboarding", "/profile"];
  if (protectedPaths.some((p) => request.nextUrl.pathname.startsWith(p)) && !user) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg)$).*)"],
};
```

### Pattern 2: Domain allowlist enforced once, at the OAuth callback — not in middleware, not as a DB trigger

**What:** Google OAuth cannot be restricted to five external institutions' domains at the provider-config level (per PROJECT.md constraint), so every sign-in from a Google account succeeds and lands at `/auth/callback` with a valid `code`. That callback route is the single place the email domain gets checked: exchange the code, inspect `user.email`, and if it doesn't match `UNI_DOMAINS`, immediately `supabase.auth.signOut()` and redirect to a friendly rejection page.
**When to use:** Any OAuth flow where the allowlist can't be pushed into the identity provider's config.
**Trade-offs:**
- **Not in middleware** — middleware would have to re-run this check on every request for every signed-in user, which is redundant (the check only matters once, right after a new sign-in) and couples a cheap edge function to a value that's already been validated.
- **Not as a Postgres trigger on `auth.users`** — a trigger can't produce a friendly in-app redirect/error message (it fires inside Supabase's own auth transaction), and raising an exception there risks surfacing a generic 500 from GoTrue instead of your UI. Keep the trigger layer (if you add one) dumb/data-only; keep policy decisions in application code.
- A rejected user's `auth.users` row still gets created by Supabase (unavoidable — the OAuth exchange happens before your code runs). This is a cosmetic cleanup concern, not a security one, since RLS means that orphaned account can never read/write a `profiles` row it doesn't own and the callback signs it out immediately.

**Example:**
```typescript
// app/auth/callback/route.ts
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const supabase = await createServerSupabaseClient();
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    const email = data.user?.email?.toLowerCase() ?? "";
    if (!error && isAllowedUniEmail(email)) {
      return NextResponse.redirect(new URL("/profile", request.url));
    }
    await supabase.auth.signOut();
  }
  return NextResponse.redirect(new URL("/auth/not-eligible", request.url));
}
```

### Pattern 3: Profile-row existence *is* the onboarding/complete routing signal — no separate status field needed

**What:** Don't pre-create a stub `profiles` row via a DB trigger on `auth.users` insert. Instead, the row is created exactly once, in full, by the onboarding Server Action on submit. `app/onboarding/page.tsx` and `app/profile/page.tsx` both do the same cheap lookup (`select` the caller's row by id) and `redirect()` to whichever route matches reality.
**When to use:** When the form is submitted as one atomic unit (this project's scope — no draft-saving requirement) rather than progressively across multiple steps/sessions.
**Trade-offs:** Simpler schema and no trigger to maintain by hand via the Supabase SQL editor. The cost is that a user who abandons the form mid-fill loses their input on that visit (acceptable — PROJECT.md explicitly scopes out draft-saving). If a later milestone needs draft persistence, revisit toward the trigger + `onboarding_completed_at` timestamp pattern instead.

**Example:**
```typescript
// app/onboarding/page.tsx
export default async function OnboardingPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");
  const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();
  if (profile) redirect("/profile");
  return <OnboardingForm />;
}
```

### Pattern 4: Photo upload happens inside the same Server Action as the profile write, not a separate client-side upload step

**What:** The onboarding `<form action={submitProfile}>` submits `FormData` including the `File` directly. The Server Action uploads it to the private `profile-photos` bucket at path `${user.id}/${filename}` using the request-scoped server client (so it's subject to the same RLS as any other authenticated write, no service-role key needed), then upserts the storage path into the `profiles` row in the same action — one round trip, one place that can fail/retry.
**When to use:** Small file uploads (a single face photo) tied 1:1 to a form submission that also writes structured data.
**Trade-offs:** Next.js caps Server Action request bodies (default ~1MB) — must raise `serverActions.bodySizeLimit` in `next.config` before this works (a required, easy-to-miss config change; flag it explicitly as a build-order dependency). For much larger files or resumable uploads you'd instead use `createSignedUploadUrl` and upload directly from the browser — not needed here given a single photo of reasonable size.

**Example:**
```typescript
// app/onboarding/actions.ts
"use server";
export async function submitProfile(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const photo = formData.get("photo") as File;
  const path = `${user.id}/${crypto.randomUUID()}.${extOf(photo.type)}`;
  const { error: uploadError } = await supabase.storage
    .from("profile-photos")
    .upload(path, photo, { upsert: true });
  if (uploadError) throw uploadError;

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    email: user.email,
    photo_path: path,
    // ...rest of validated fields
  });
  if (error) throw error;
  redirect("/profile");
}
```

## Data Flow

### Request Flow — first sign-in through profile creation

```
[Sign-in button, Client Comp]
    ↓ supabase.auth.signInWithOAuth({ provider: "google", redirectTo: "<origin>/auth/callback" })
[Google consent screen]
    ↓ redirect with ?code=
[middleware.ts]  → refreshes cookies, no-ops (route not yet protected-gated on this leg)
    ↓
[app/auth/callback/route.ts]
    ↓ exchangeCodeForSession(code) → session cookie set
    ↓ isAllowedUniEmail(user.email)?
    ├─ no  → signOut() → redirect /auth/not-eligible
    └─ yes → redirect /profile
[app/(protected)/layout.tsx] → getUser() re-check (defense in depth)
[app/profile/page.tsx] → select profiles by id → no row found
    ↓ redirect /onboarding
[app/onboarding/page.tsx] → renders OnboardingForm (Client Comp)
    ↓ user fills form, submits
[app/onboarding/actions.ts submitProfile Server Action]
    ↓ getUser() (server-derived id, never trust client input)
    ↓ storage.upload(profile-photos, `${id}/...`)
    ↓ profiles.upsert({ id, ...fields, photo_path })
    ↓ redirect /profile
[app/profile/page.tsx] → select profiles by id → row found
    ↓ storage.createSignedUrl(photo_path, 60s) → pass to <img>
    ↓ renders confirmation + edit view
```

### Returning-user flow (already has a profile)

```
[middleware.ts] → session valid → passes through
[app/(protected)/layout.tsx] → getUser() ok
[app/profile/page.tsx] → profiles row exists → renders confirmation/edit directly (no bounce)
```

### Key Data Flows

1. **Auth state → route redirect:** signed-out visitors to `/onboarding` or `/profile` are bounced by `middleware.ts`; signed-in visitors are further routed between the two pages by profile-row existence, checked independently by each page (not centralized in middleware, to keep the edge function cheap).
2. **Photo → signed URL:** the raw storage path (`photo_path`) is the only thing persisted in Postgres; a display-ready URL is generated fresh, server-side, on every render of `/profile` via `createSignedUrl`, never cached or stored.
3. **Domain allowlist → single source of truth:** `lib/uni-domains.ts` is read by both `app/api/waitlist/route.ts` (existing) and `app/auth/callback/route.ts` (new), so the five accepted domains never drift between the two entry points.

## Scaling Considerations

This is a pilot for five Melbourne campuses — realistically dozens to low hundreds of profiles. No part of this design needs to change for that scale.

| Scale | Architecture Adjustments |
|-------|---------------------------|
| Pilot (0–1k profiles) | Exactly as designed above. Single `profiles` table, no caching layer, signed URLs generated per-request are cheap enough. |
| 1k–10k profiles | If `/profile` traffic grows, wrap the signed-URL generation in a short (`revalidate: 30`) fetch cache rather than regenerating on every render. No schema changes needed. |
| 10k+ profiles | Out of scope for this milestone; would coincide with building the actual matching/browsing product, which is explicitly out of scope here too. |

### Scaling Priorities

1. **Not a concern for this milestone.** The one thing worth building correctly now rather than retrofitting later is the RLS policies (Pattern in PITFALLS-adjacent territory) — get `auth.uid() = id` scoping right from the first SQL file, since loosening/tightening RLS after real user data exists is riskier than doing it right from the start.

## Anti-Patterns

### Anti-Pattern 1: Trusting a client-submitted user id for the profile write

**What people do:** Pass `userId` as a hidden form field or from client-side `supabase.auth.getUser()` state into the write call.
**Why it's wrong:** A hidden field can be tampered with; even without tampering, it duplicates a value the server can derive authoritatively. Combined with weak RLS, this is a classic path to writing/reading another user's row.
**Do this instead:** Every write derives `user.id` from `supabase.auth.getUser()` called *inside* the Server Action/Route Handler, using the request-scoped server client — never from form input.

### Anti-Pattern 2: Making the photo bucket public "to avoid dealing with signed URLs"

**What people do:** Flip the bucket to public so `<img src>` can point straight at the object URL.
**Why it's wrong:** Directly violates the PROJECT.md security constraint (photos are unreviewed dating-profile face photos of students — must stay private until manually approved) and turns any leaked/guessed path into an open access point.
**Do this instead:** Keep the bucket private, generate short-lived `createSignedUrl` results server-side on each render of the page that needs to show the photo.

### Anti-Pattern 3: Relying on `getSession()` in middleware or trusting middleware as the only auth check

**What people do:** Call `supabase.auth.getSession()` in middleware (reads the cookie without revalidating against the Auth server) and treat middleware passing as proof the request is safe to act on downstream.
**Why it's wrong:** `getSession()` in server contexts is not guaranteed to catch an expired/tampered token; middleware can also be bypassed by matcher misconfiguration or edge-runtime quirks. Treating it as sufficient authorization creates a false sense of security.
**Do this instead:** Middleware uses `getUser()` (which revalidates against Supabase) purely to refresh cookies and give a fast UX redirect. Every Server Component/Action that actually reads/writes user data calls `getUser()` again itself.

### Anti-Pattern 4: Enforcing the domain allowlist only in the onboarding form's client-side copy

**What people do:** Show a "must be a uni email" message in the UI but let the Server Action save whatever `user.email` the session has.
**Why it's wrong:** Directly contradicts PROJECT.md's explicit requirement ("enforced server-side") and is trivially bypassed by anyone who reaches `/onboarding` with a valid non-uni Google session.
**Do this instead:** Enforcement happens once, at `/auth/callback`, before any session is allowed to persist (Pattern 2 above). By the time `/onboarding` renders, the email is already guaranteed valid — no need to re-check it in the form.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|----------------------|-------|
| Google OAuth (via Supabase Auth) | `signInWithOAuth({ provider: "google" })` from browser client, redirect URL configured in both Google Cloud Console and Supabase dashboard | Configuration is entirely external to this codebase — PROJECT.md already flags this as a user-side setup dependency; code can only assume it exists. Get the exact `redirectTo` value confirmed before writing the callback route. |
| Supabase Storage (`profile-photos` bucket) | Server-side `upload()` in the onboarding Server Action, `createSignedUrl()` on read | Bucket must be created as **private** in the same SQL file that sets its RLS policies (`supabase/profile-photos-storage.sql`), matching the existing `supabase/` manual-migration pattern. |
| Supabase Postgres (`profiles` table) | RLS-scoped reads/writes via the request-scoped server client, never the service-role key | `supabase/profiles.sql` — new file, same delivery pattern as `founding-member.sql` / `venues.sql`. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|----------------|-------|
| Existing marketing/waitlist code ↔ new auth code | No shared runtime state — only a shared constant (`lib/uni-domains.ts`) | Keeps the "must not disturb existing features" constraint trivially satisfiable; the two halves of the app don't otherwise import from each other. |
| `middleware.ts` ↔ page-level Server Components | One-way: middleware only decides "signed in or not"; pages independently decide "onboarding or profile" | Prevents the edge middleware from needing a database round trip on every request. |
| `OnboardingForm.tsx` (Client Comp) ↔ `actions.ts` (Server Action) | `<form action={submitProfile}>` — no manual `fetch`/JSON wiring needed | Matches the "only this app calls it" rule for choosing Server Actions over a Route Handler for this write. |

## Suggested Build Order

1. **`@supabase/ssr` foundation** — add the dependency; write `lib/supabase-browser.ts`, `lib/supabase-server.ts`, `lib/supabase-middleware.ts`. Nothing else can be built or tested without this.
2. **SQL files** (`supabase/profiles.sql`, `supabase/profile-photos-storage.sql`) — can be authored in parallel with #1, but must be run by the user in the Supabase dashboard before any write-path code can be exercised end-to-end. Get RLS right here; it's the highest-cost-to-fix-later piece.
3. **`middleware.ts`** — depends on #1. Testable in isolation (visit `/onboarding` signed out → redirected).
4. **Sign-in entry point + `app/auth/callback/route.ts`** — depends on #1 and Google OAuth being configured (external, user-owned setup). This is also where the domain allowlist gets enforced; extract `lib/uni-domains.ts` from the waitlist route as part of this step.
5. **`app/(protected)/layout.tsx` + the two routing pages** (`onboarding/page.tsx`, `profile/page.tsx`, empty/stub form for now) — depends on #2 (table must exist) and #4 (need a way to arrive here signed in). This is where the three routing states (signed out / signed in without profile / signed in with profile) become independently testable.
6. **Onboarding form + Server Action**, including raising `serverActions.bodySizeLimit` in `next.config` for the photo upload — depends on #2 and #5.
7. **Profile confirmation/edit view** reusing the onboarding form component in "edit" mode, with signed-URL photo display — depends on #6 (shares the form component and the action's upsert semantics).

This order lets each phase produce something independently verifiable: #1–3 are testable with a fake/no session, #4 requires real Google OAuth config, #5 is testable with a real signed-in user and an empty table, #6–7 complete the user-facing feature.

## Sources

- Supabase Docs — Server-Side Auth for Next.js (`@supabase/ssr`, middleware `updateSession` pattern, `getUser()` vs `getSession()` guidance) — MEDIUM confidence (web search cross-checked against official supabase.com/docs domain, not fetched via a docs MCP in this run)
- Supabase Docs — `exchangeCodeForSession` reference and Google social-login guide — MEDIUM confidence
- Supabase Docs / community — Storage `createSignedUrl` pattern for private buckets, storage.objects RLS scoped to per-user folder prefix — MEDIUM confidence
- Community sources (Wisp CMS, makerkit.dev, pean.dev) — Server Actions vs Route Handlers decision rule ("only your app calls it → Server Action") — MEDIUM confidence, consistent across multiple independent sources
- Supabase Docs / community — RLS `auth.uid() = id` per-row-ownership pattern for a `profiles` table, `(select auth.uid())` performance wrapping — MEDIUM confidence
- Project-local: `.planning/PROJECT.md`, `lib/supabase.ts`, `app/api/waitlist/route.ts`, `app/api/venues/route.ts`, `package.json`, existing `supabase/*.sql` files — read directly, HIGH confidence (ground truth for this codebase)

---
*Architecture research for: Next.js App Router + Supabase Auth/Storage integration onto an existing marketing site*
*Researched: 2026-08-03*
