# Phase 2: Google Sign-In, Domain Gate & Protected Routing - Context

**Gathered:** 2026-08-03
**Status:** Ready for planning
**Mode:** Lean (auto-generated from locked PROJECT/STATE decisions + MVP design; discuss questions minimized per user request for speed)

<domain>
## Phase Boundary

A student can sign in with their university Google account, is rejected server-side if they use a non-partner email, stays signed in across sessions, can sign out, and lands on the correct screen for their account state (onboarding vs confirmation).

Delivers: a login screen ("Login here for pilot trials" → Continue with Google, per `specs/MVP design .png`), the Supabase Google OAuth sign-in call, an `/auth/callback` route handler that exchanges the code and enforces the university-domain allowlist, a friendly domain-rejection error page, sign-out, and the protected-routing logic (signed-out → login; signed-in + no profile row → onboarding; signed-in + profile row → confirmation).

Does NOT deliver: the onboarding form itself (Phase 3), the confirmation/next-steps screens' content (Phase 4), payment (Phase 3). Phase 2 creates route stubs/redirect targets only where needed to prove routing.
</domain>

<decisions>
## Implementation Decisions

### Locked (from PROJECT.md / STATE.md — do not revisit)
- **Domain allowlist enforced server-side in the OAuth callback route** (`app/auth/callback/route.ts`), NOT a Postgres "Before User Created" hook. Friendlier UX; RLS on `profiles` independently prevents a rejected account from reaching data. (STATE.md decision.)
- **Profile-row existence is the routing/completion signal** — no `profile_status` column. Signed-in user with a `profiles` row → confirmation view; without → onboarding. (STATE.md decision.)
- **Protected routing folded into this phase** (not standalone). (STATE.md decision.)
- **Google-only auth via Supabase Auth** — no email/password or magic link.
- The five partner domains are the SAME list already used server-side in `app/api/waitlist/route.ts` (`@student.unimelb.edu.au`, `@student.monash.edu`, `@deakin.edu.au`, `@student.rmit.edu.au`, `@students.latrobe.edu.au`). Reuse/extract that list — single source of truth.

### Claude's Discretion (sensible defaults)
- **Login route:** `/login` (dedicated screen matching the MVP design's second panel). The existing landing page's "Sign up" CTA can point here in a later pass; Phase 2 just needs the route to exist and be reachable.
- **Callback route:** `/auth/callback` — exchanges `code` for a session via `exchangeCodeForSession`, reads the verified user's email via `getUser()`, checks it against the allowlist. On non-partner email: sign the user out and redirect to `/login?error=domain` (or a small `/auth/auth-code-error` page) with the friendly "use your uni account" copy. On success: redirect based on profile-row existence.
- **Domain check uses the verified email from `getUser()`** (JWT-validated), never a client-supplied value.
- **Sign-out:** a server action / route handler (`/auth/signout`) callable from any authenticated page (a small SignOut button component).
- **Protected-routing enforcement point:** a server-side check in the authenticated area (layout or per-page `getUser()` + `profiles` select), consistent with CLAUDE.md's "gate in a server component/layout" guidance. Middleware already refreshes the session (Phase 1); the redirect decision lives server-side where trusted `profiles` data is available.
- **Redirect targets that don't exist yet** (`/onboarding`, `/confirmation`) get minimal placeholder pages in this phase so routing is provable end-to-end; Phase 3/4 fill them in.
- **Visual style:** match the existing vintage-romance theme — parchment background (`--parchment`, `--parchment-deep`), `--ink` text, `--terracotta` accent, Jersey display font (`font-jersey`) for headings, Helvetica/Arial for body — consistent with `WaitlistModal.tsx`, `Hero.tsx`, `Navbar.tsx`. The MVP design's login panel (warm background, centered "Login here for pilot trials", a single "Continue with Google" button) is the layout reference.
- **AUTH-05 (redirect URLs):** document required Supabase + Google Cloud Console redirect URLs (localhost:3002 for dev, https://campus-crush.org for prod) in a go-live checklist file under `supabase/` or `docs/` — code assumes OAuth is already configured by the user.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- **SSR clients from Phase 1:** `lib/supabase/server.ts` (`createClient()` — cookie-aware, use in the callback route + server components), `lib/supabase/client.ts` (browser, for the `signInWithOAuth` call from the login button), `lib/supabase/middleware.ts` + root `middleware.ts` (session refresh — already wired).
- **Domain list + university mapping:** `app/api/waitlist/route.ts` has `UNI_DOMAINS` (suffix → university). Extract to a shared module (e.g. `lib/uni-domains.ts`) so the waitlist API and the auth gate share one list. The waitlist modal (`components/WaitlistModal.tsx`) also has a client copy (`ACCEPTED_DOMAINS`).
- **Styling tokens:** `app/globals.css` defines `--parchment`, `--parchment-deep`, `--ink`, `--terracotta`; `font-jersey` class used across components.

### Established Patterns
- Route handlers live under `app/api/*/route.ts` (`export const dynamic = "force-dynamic"`). The OAuth callback follows the same App Router route-handler shape under `app/auth/callback/route.ts`.
- `getUser()` for any identity/authorization decision (CLAUDE.md — never `getSession()`).
- Next 16 App Router, React 19, Tailwind 4. Dev server PORT=3002.

### Integration Points
- Login button calls `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: <origin>/auth/callback } })`.
- Callback route → domain gate → redirect to `/onboarding` or `/confirmation`.
- Landing page CTA (`components/Hero.tsx` / `Navbar.tsx`) can later link to `/login` — out of strict scope but low-risk.
</code_context>

<specifics>
## Specific Ideas

- The MVP design's login panel: warm/parchment background, centered heading "Login here for pilot trials", one "Continue with Google" button with the Google `G` mark, and a location-pin/avatar motif. Keep it simple and on-brand; don't over-build.
- Domain-rejection page copy: friendly, e.g. "Please use your university Google account — Campus Crush is open to UniMelb, Monash, Deakin, RMIT, and La Trobe students." Mirror the tone of the existing waitlist error copy.
</specifics>

<deferred>
## Deferred Ideas

- Wiring the landing-page hero/nav CTAs to `/login` app-wide — can be a small follow-up; not required to prove Phase 2.
- Rich onboarding/confirmation page content — Phases 3 and 4.
</deferred>
