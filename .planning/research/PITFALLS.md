# Pitfalls Research

**Domain:** Supabase Auth (Google OAuth) + Storage + RLS in a Next.js App Router dating-pilot app
**Researched:** 2026-08-03
**Confidence:** MEDIUM (web-search-derived, cross-checked against Supabase's own docs/discussions and multiple independent write-ups; no official Supabase Context7 docs were queried in this pass)

## Critical Pitfalls

### Pitfall 1: Trusting `getSession()` for server-side authorization

**What goes wrong:**
Code in middleware, Server Components, or Route Handlers calls `supabase.auth.getSession()` and treats the returned user as authenticated/authorized. Because `getSession()` reads the session straight out of cookies/local storage without re-validating the JWT against the Supabase Auth server, a forged, stale, or spoofed cookie can pass this check. This is exactly the kind of check a profile-onboarding flow (gatekeeping "is this a real, current uni Google account?") depends on.

**Why it happens:**
`getSession()` is the more familiar/older API and is faster (no network round trip), so it "just works" in local testing and looks identical to `getUser()` until someone probes it with a manipulated cookie.

**How to avoid:**
Always use `supabase.auth.getUser()` (or `getClaims()` for a lighter-weight JWT-verification check) in any server-side code that gates access to a page, API route, or writes to `profiles`. Reserve `getSession()` for the rare case where you need the raw access/refresh token strings, never for an authorization decision.

**Warning signs:**
Any `getSession()` call inside `middleware.ts`, a Route Handler, or a Server Component that's used to decide "show this page" or "allow this write."

**Phase to address:**
Auth/session-plumbing phase (the phase that sets up the Supabase server client, middleware, and any protected route/layout).

---

### Pitfall 2: Middleware refreshes the session but drops the cookies

**What goes wrong:**
The Next.js middleware creates a Supabase server client and calls `getUser()` to refresh the session, but the refreshed cookies from the Supabase client aren't copied onto the outgoing `NextResponse`. The session silently dies at the edge — users get logged out on their next navigation, or Server Components render stale/unauthenticated state even though the browser still has an old cookie.

**Why it happens:**
The `@supabase/ssr` middleware pattern requires manually forwarding `request.cookies` → `response.cookies` on every `set`/`remove` call. It's easy to copy example code that handles the `getUser()` call but misses the cookie-forwarding boilerplate, especially when adapting a starter to fit existing middleware (if this app already has middleware for anything else, merging the two is a common place to lose this step).

**How to avoid:**
Use the official `@supabase/ssr` `updateSession` pattern verbatim (not `@supabase/auth-helpers-nextjs`, which is deprecated). Confirm the middleware returns the `NextResponse` object that the Supabase client itself mutated, not a fresh one created afterward. Test by loading a protected page, waiting past a short token lifetime (or manually expiring the cookie), and confirming the session survives a refresh.

**Warning signs:**
Users report random logouts; auth state differs between a Server Component and a Client Component on the same page; session persists in dev but not after Vercel deploy (edge middleware behaves differently under load).

**Phase to address:**
Auth/session-plumbing phase.

---

### Pitfall 3: PKCE callback route mismatch or double-consumption of the auth code

**What goes wrong:**
The OAuth (and future magic-link/email) redirect lands on a route the app never implemented, or the code-exchange handler is hit twice (e.g., via Next.js `<Link>` prefetching or a user double-clicking "Continue with Google"), causing "invalid request: both auth code and code verifier should be non-empty" or "code already used" errors that surface as a broken login with no clear error message to the user.

**Why it happens:**
Supabase's own docs and default flows have historically been inconsistent between `/auth/callback` and `/auth/confirm` route naming across email/OAuth flows, so it's easy to copy an example that uses the wrong path. The auth code is single-use and expires in 5 minutes, so any double-fire (prefetch, resubmit, back-button) breaks the exchange.

**How to avoid:**
Implement exactly one Route Handler at `/auth/callback` that calls `exchangeCodeForSession(code)`, redirects on success, and redirects to a clear "sign-in failed, try again" state on error (never a raw stack trace). Disable prefetch on the "Continue with Google" link/button (it should be a real navigation, not a `<Link>`). Make the callback idempotent-safe by redirecting immediately after exchange rather than leaving the code in the URL for a retry.

**Warning signs:**
Intermittent "sign-in failed" reports that don't reproduce consistently; errors mentioning code verifier or expired code in Supabase Auth logs.

**Phase to address:**
Auth/session-plumbing phase.

---

### Pitfall 4: RLS policy fails silently — empty result looks like "no data," not "no access"

**What goes wrong:**
Row Level Security denies a query and Postgres/PostgREST returns an empty result set (`[]`), not an error. A too-strict `profiles` policy (e.g., forgetting the `INSERT` policy, or writing the `USING` clause backwards) looks exactly like "user has no profile yet" — nobody notices until support tickets pile up. In the opposite direction, a too-loose policy (e.g., a `SELECT` policy with no `USING` clause, or RLS never enabled on the table at all) means any authenticated — or even anonymous, via the public anon key — request can read every student's profile including ethnicity, dating intention, and photos. This is not hypothetical: CVE-2025-48757 (May 2025) found 170+ production apps leaking full user data because RLS was never enabled on table creation, exploitable with nothing but the public anon key baked into the client bundle.

**Why it happens:**
Supabase tables are RLS-off by default. Enabling RLS with zero policies makes a table fully locked (safe but confusing); forgetting to enable RLS at all makes it fully open (silently catastrophic). Both look identical during casual manual testing if you're testing as the table owner/service role, which bypasses RLS entirely.

**How to avoid:**
For the `profiles` table (and any future tables holding user data): enable RLS in the same migration that creates the table, never in a follow-up. Write and test all four operations — `SELECT`, `INSERT`, `UPDATE`, `DELETE` — not just `SELECT`. Test using the actual anon key + a real user JWT (not the service role key) from at least two different authenticated accounts to confirm user A cannot read/write user B's row. Add this as an explicit manual check in the phase's verification step, since Supabase gives no automatic warning.

**Warning signs:**
A migration file that creates a table but the `ENABLE ROW LEVEL SECURITY` and policy statements are missing or in a separate/later file; any query testing done exclusively with the service role key; "it works" verification that only checked the logged-in user's own data, never a second account.

**Phase to address:**
Database/schema phase (where `profiles` table + RLS policies are defined) — this is the single highest-severity pitfall in this milestone given the sensitivity of the data (photos, ethnicity, sexuality/dating-intention-adjacent fields).

---

### Pitfall 5: `auth.uid()` used unwrapped in RLS policies (correctness is fine, but silently expensive)

**What goes wrong:**
RLS policies write `USING (user_id = auth.uid())` directly. This is functionally correct but Postgres re-evaluates `auth.uid()` as a per-row function call instead of caching it once per query. At small pilot scale (dozens of rows) this is invisible; it's included here because it's the kind of thing worth doing right the first time, since fixing it later means touching every policy again.

**Why it happens:**
Most tutorials (including Supabase's own older examples) show the unwrapped form; the wrapped form is a newer, less obvious optimization.

**How to avoid:**
Write every RLS policy using `(select auth.uid())` instead of bare `auth.uid()` — e.g. `USING (user_id = (select auth.uid()))`. Same applies to `auth.role()`, `auth.jwt()`, `current_setting()`. Functionally identical, meaningfully faster as row counts grow.

**Warning signs:**
Not user-visible at pilot scale — this is a "do it right in the migration file" item, not a runtime symptom to watch for.

**Phase to address:**
Database/schema phase (same migration that writes the RLS policies).

---

### Pitfall 6: Domain allowlist enforced only in the client (or only in app code, not the database)

**What goes wrong:**
The onboarding flow checks `user.email.endsWith('@student.unimelb.edu.au')` (etc.) in a React component or a single Route Handler, then redirects/signs out non-matching users. Because Google OAuth itself has no way to restrict sign-in to five separate external institution domains (Google's domain restriction only works for a single Google Workspace org, not five unrelated universities), any check that lives purely in application code can be bypassed by calling the Supabase REST API directly with a valid session token from a non-partner Google account — the row still gets created in `auth.users`, and if any client-side-only gate is the only thing standing between that account and the `profiles` table, it can be worked around.

**Why it happens:**
It's the most natural place to implement — the requirement is UI-shaped ("show a message, sign them out"), so a client check feels sufficient, especially since it does correctly handle the happy path.

**How to avoid:**
Enforce the domain allowlist in two layers: (1) a Postgres trigger (`BEFORE INSERT OR UPDATE` on `auth.users`, `SECURITY DEFINER`, `SET search_path = ''`) that raises an exception and blocks the row entirely if the email domain isn't in an allowlist table, and (2) a friendly client-side/server-side UX check that shows a clear "your university isn't part of the pilot yet" message before the user hits the trigger error. Store the five domains in a small allowlist table (not hardcoded in the trigger function) so adding a sixth university later is a data change, not a code change. Normalize to lowercase before comparing.

**Warning signs:**
Domain check exists only as an `if` statement in a client component or a single API route with no corresponding database-level constraint; the check can be skipped by hitting Supabase directly (verify by testing with curl + a valid non-partner-domain JWT).

**Phase to address:**
Auth/session-plumbing phase for the trigger + allowlist table (this is really a database-layer concern even though it's triggered by an auth event); onboarding-flow phase for the friendly UX message.

---

### Pitfall 7: Storage bucket public/private confusion — `getPublicUrl()` used on a private bucket

**What goes wrong:**
Face photos are uploaded to a bucket intended to be private (per the spec), but the code calls `storage.from('photos').getPublicUrl(path)` — a function that only returns a working URL for public buckets. On a private bucket it silently returns a URL that 400s/403s for everyone, including the team member trying to do manual review, OR — worse — the bucket itself was accidentally left public during setup and `getPublicUrl()` "works," meaning every uploaded face photo is reachable by anyone with the URL pattern, with no auth check at all.

**Why it happens:**
`getPublicUrl()` and `createSignedUrl()` have similar-looking signatures and both are common in copy-pasted examples; which one is "correct" depends entirely on the bucket's public/private setting, which is easy to get wrong or leave unverified during setup.

**How to avoid:**
Create the bucket explicitly as private (`public: false`) in the setup SQL/dashboard step, and verify it — don't assume. For any photo the team needs to view (manual review), generate a short-lived `createSignedUrl()` server-side only, never `getPublicUrl()`. Add storage RLS policies on `storage.objects` restricting `INSERT` to the owning authenticated user's own path (e.g., path prefixed with their `user_id`) and `SELECT` to the owner and/or a service-role-only review context — not to `public`/`anon`.

**Warning signs:**
Any use of `getPublicUrl()` in code touching the photos bucket; bucket dashboard shows "Public" toggle on; no RLS policies listed under `storage.objects` for the photos bucket.

**Phase to address:**
Storage/photo-upload phase.

---

### Pitfall 8: Redirect URL / Site URL not updated for production before launch

**What goes wrong:**
Google OAuth and Supabase Auth are configured and tested against `http://localhost:3002` during development. When deployed to `campus-crush.org` via Vercel, sign-in either fails outright (redirect URI mismatch error from Google) or succeeds but bounces the user back to `localhost` because the Supabase project's "Site URL" setting (the default `redirectTo` fallback) was never updated.

**Why it happens:**
This app already deploys automatically to production on every push to `main` (per existing Vercel setup) — there's no separate staging gate to catch environment-specific config before it's live in production. Google Cloud Console and the Supabase dashboard are two separate places that both need the production URL added, and it's easy to update one and forget the other.

**How to avoid:**
Since Supabase config is entirely dashboard-driven and can't be scripted from this environment (per project constraints), document the required dashboard steps explicitly in the phase's setup instructions for the user: add `https://campus-crush.org/**` (and the Vercel preview pattern if used) to both Supabase's Redirect URLs allowlist and Google Cloud Console's Authorized redirect URIs, and set Supabase's Site URL to `https://campus-crush.org`. Treat this as a go-live checklist item, not an assumption.

**Warning signs:**
Sign-in works locally but the "Redirect not allowed" or Google `redirect_uri_mismatch` error appears once deployed; users land on a `localhost` URL after completing Google sign-in on the live site.

**Phase to address:**
Auth/session-plumbing phase (as a deployment/verification checklist item, since this project auto-deploys to production).

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|-----------------|------------------|
| Testing RLS policies only with the service role key | Fast, no auth setup needed for manual testing | Never actually proves user-to-user isolation works; the exact gap that caused real breaches | Never — even at pilot scale, test with real user JWTs |
| Client-side-only domain allowlist check | Faster to implement, good UX message | Bypassable via direct API calls; anyone can insert a row into `profiles` for a non-partner account | Never for the trigger itself; fine as a UX layer on top of a DB-level trigger |
| Skipping storage RLS and relying on "the bucket is private so it's fine" | One less migration to write | Private buckets still need object-level policies restricting who can list/read which files; a private bucket with no policies is fully locked (breaks review) or, if a policy is too broad, effectively public to any authenticated user | Never — write explicit `storage.objects` policies scoped by path/owner |
| Hardcoding the 5 university domains directly in a trigger function body | Slightly less setup | Adding/removing a partner university means a schema migration instead of a data update | Acceptable only if genuinely fixed forever; given the pilot is explicitly expanding partner unis, use an allowlist table instead |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|-----------------|-------------------|
| Google Cloud Console OAuth | Only Supabase's redirect URL list updated, Google Console's Authorized redirect URIs left on old/localhost value | Update both; the two are separate systems that must agree |
| `@supabase/ssr` middleware | Using deprecated `@supabase/auth-helpers-nextjs` patterns found in older tutorials | Use `@supabase/ssr` exclusively; auth-helpers is deprecated and no longer gets fixes |
| Supabase Storage signed URLs | Generating signed URLs client-side, or reusing `getPublicUrl()` for a private bucket | Generate `createSignedUrl()` server-side only, scoped to a short expiry, only for authorized viewers (the photo owner, or a server-side review context) |
| Postgres trigger on `auth.users` | Trigger function without `SECURITY DEFINER` + `SET search_path = ''`, or referencing a hardcoded domain list | Use `SECURITY DEFINER`, empty `search_path`, and a lookup table for allowed domains |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|------------------|
| Bare `auth.uid()` in RLS `USING` clauses | Not visible at pilot scale | Always wrap as `(select auth.uid())` in every policy from the start | Becomes measurable well before "1M users" — Supabase's own docs cite a 100K-row table as the point where it's a multi-second difference |
| Middleware running the full Supabase session-refresh path on every request including static assets | Unnecessary latency added to every request, wasted Auth API calls | Scope the middleware `matcher` to exclude static assets/images/`_next` paths | Not urgent at pilot scale, but cheap to configure correctly upfront |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| RLS not enabled on `profiles` (or enabled with an overly broad `SELECT` policy) | Every student's face photo, ethnicity, dating intention, and availability readable by anyone with the anon key — the exact CVE-2025-48757 pattern | Enable RLS in the same migration as table creation; write narrow, tested policies for all four operations; verify with a second real user account, not just the service role |
| Photos bucket left public, or `getPublicUrl()` used for private content | Face photos of students (identifiable, sensitive) become world-readable via guessable/enumerable URLs | Private bucket + `createSignedUrl()` server-side only + `storage.objects` RLS scoped to owner/reviewer |
| Domain allowlist enforced client-side only | Non-partner-university accounts can create profiles, polluting the pilot data and violating the stated scope | Postgres trigger on `auth.users` as the real gate; client check is UX only |
| Sensitive fields (ethnicity, dating intention, availability) stored with the same access breadth as non-sensitive fields | A single overly broad policy exposes special-category-adjacent data, not just innocuous profile info | Treat the whole `profiles` row as sensitive by default — a single tight `user_id = (select auth.uid())` policy covering all columns is simpler and safer than trying to split sensitivity by column |
| `getSession()` used for any authorization decision | Forged/stale session data trusted without server-side revalidation | `getUser()`/`getClaims()` only, server-side, for anything gating access |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-------------------|
| Raw Supabase/Postgres error surfaced when a non-partner-domain user is rejected by the trigger | Confusing, unbranded error page mid-sign-in | Catch the trigger's exception in the callback handler and redirect to a friendly "your university isn't part of the pilot yet" page before the error ever reaches raw form |
| No distinction between "new user needs onboarding" and "returning user with incomplete profile" vs. "session expired" | User bounced to onboarding repeatedly, or stuck unable to tell why they're logged out | Middleware/layout should check both auth state and profile-completion state explicitly, with distinct redirect targets for each case |
| Silent failure when RLS denies a write (blank success-looking response or generic error) | User submits onboarding form, nothing saves, no clear reason why | Check Supabase client response for both `error` and unexpectedly-empty `data` after INSERT/UPDATE; surface a real error message rather than assuming success |

## "Looks Done But Isn't" Checklist

- [ ] **RLS on `profiles`:** Often missing INSERT/UPDATE policies even when SELECT works — verify by testing a full onboarding submit as a real (non-service-role) authenticated user, and confirm a second user account cannot read/edit the first user's row
- [ ] **Domain allowlist:** Often only implemented as a client-side redirect — verify by attempting to call the Supabase REST/JS API directly with a valid session from a non-partner-domain Google account and confirming the row insert is rejected at the database level
- [ ] **Private photo bucket:** Often left public or missing `storage.objects` policies — verify the bucket's public flag is false in the dashboard AND that `getPublicUrl()` is not used anywhere in the upload/review code path
- [ ] **Middleware session refresh:** Often "works" in the first dev session but breaks after token expiry — verify by waiting past a token lifetime (or manually invalidating) and confirming the session refreshes rather than silently logging the user out
- [ ] **Production OAuth config:** Often tested only on localhost — verify sign-in end-to-end on the deployed `campus-crush.org` domain before considering the phase done, since this project auto-deploys to production on merge

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|-----------------|------------------|
| RLS leak discovered after launch (data exposed) | HIGH | Immediately tighten/disable the offending policy, rotate any exposed signed-URL patterns, audit Supabase logs for anon-key access to the table, notify affected students per privacy obligations |
| Domain allowlist bypass discovered after some non-partner accounts exist | MEDIUM | Add the DB trigger retroactively, then manually identify and remove/flag any `profiles` rows tied to non-partner-domain `auth.users` emails |
| Public bucket found to have been open | HIGH | Flip bucket to private immediately, rotate/regenerate any previously-shared public URLs to be signed-URL-only, review Storage access logs for unexpected external access |
| Session refresh bug causing random logouts | LOW | Fix the middleware cookie-forwarding, no data at risk, just a UX annoyance during the pilot |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|-------------------|----------------|
| `getSession()` used for authz | Auth/session-plumbing phase | Grep codebase for `getSession(` in any server-side file; confirm none are used to gate access |
| Middleware drops refreshed cookies | Auth/session-plumbing phase | Manually expire a session cookie and confirm the app refreshes it instead of logging out |
| PKCE callback route mismatch/double-fire | Auth/session-plumbing phase | End-to-end sign-in test on both dev and production; confirm no prefetch on the sign-in link |
| RLS silently locks or leaks `profiles` | Database/schema phase | Test all 4 CRUD ops with two distinct real user JWTs (not service role) |
| Bare `auth.uid()` in policies | Database/schema phase | Code review of migration SQL — every `auth.uid()` reference wrapped in `(select ...)` |
| Domain allowlist bypassable client-side | Auth/session-plumbing phase (trigger) + onboarding phase (UX) | Attempt direct API insert with a non-partner-domain JWT; confirm DB-level rejection |
| Private bucket misconfigured / `getPublicUrl()` misuse | Storage/photo-upload phase | Confirm bucket `public: false` in dashboard; grep for `getPublicUrl(` in photo-related code |
| Redirect URL / Site URL not production-ready | Auth/session-plumbing phase | End-to-end sign-in test on `campus-crush.org` before declaring the phase complete, not just localhost |

## Sources

- [Redirect URLs | Supabase Docs](https://supabase.com/docs/guides/auth/redirect-urls)
- [Supabase Auth Callback Redirect Not Working? Next.js Fix](https://www.iloveblogs.blog/post/supabase-auth-redirect-fix)
- [Next.js PKCE Woes · supabase discussion #20922](https://github.com/orgs/supabase/discussions/20922)
- [Advanced guide | Supabase Docs](https://supabase.com/docs/guides/auth/server-side/advanced-guide)
- [Security and performance risk with `getUser` and `getSession` · supabase/auth-js#898](https://github.com/supabase/auth-js/issues/898)
- [Setting up Server-Side Auth for Next.js | Supabase Docs](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Why Your Supabase Data Is Exposed (And You Don't Know It) - DEV Community](https://dev.to/jordan_sterchele/why-your-supabase-data-is-exposed-and-you-dont-know-it-25fh)
- [Supabase RLS: Common Mistakes, the (select auth.uid()) Trap & CVE-2025-48757 Breakdown](https://vibeappscanner.com/supabase-row-level-security)
- [Supabase security breaches: what actually happened · GuardLayer](https://www.guardlayer.io/blog/supabase-security-breaches)
- [76 RLS policies rewritten in one migration: the auth.uid() init-plan trap in Supabase - DEV Community](https://dev.to/arvavit/76-rls-policies-rewritten-in-one-migration-the-authuid-init-plan-trap-in-supabase-4hg)
- [RLS Performance and Best Practices | Supabase Docs](https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv)
- [Supabase Storage Deep Dive — Bucket Design, Signed URLs, Image Transforms, and RLS - DEV Community](https://dev.to/kanta13jp1/supabase-storage-deep-dive-bucket-design-signed-urls-image-transforms-and-rls-3b9k)
- [Failing RLS policy on bucket returns 400 instead of 403 · supabase/storage#640](https://github.com/supabase/storage/issues/640)
- [Taming Supabase & Next.js Auth: Why Your Users Keep Getting Logged Out](https://javascript.plainenglish.io/fix-nextjs-supabase-auth-logouts-ff858efdced5)
- [Restrict Signups by Email Domain in Supabase | RapidDev](https://www.rapidevelopers.com/supabase-tutorial/how-to-allow-sign-in-only-with-specific-domains-in-supabase)
- [limiting oauth to specific emails · supabase discussion #5088](https://github.com/orgs/supabase/discussions/5088)
- [Data-Hungry Dating Apps Are Worse Than Ever for Your Privacy - Mozilla Foundation](https://www.mozillafoundation.org/en/privacynotincluded/articles/data-hungry-dating-apps-are-worse-than-ever-for-your-privacy/)
- [Privacy on Dating Sites: Why Data Security and Compliance Are Important - GDPR Local](https://gdprlocal.com/privacy-dating-sites-and-apps/)

---
*Pitfalls research for: Supabase Auth + Storage + RLS integration into Next.js App Router (Campus Crush user accounts & onboarding milestone)*
*Researched: 2026-08-03*
