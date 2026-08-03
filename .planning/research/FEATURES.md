# Feature Research

**Domain:** Dating-app onboarding & profile flows (Google-auth, single-sided manual-match pilot)
**Researched:** 2026-08-03
**Confidence:** MEDIUM

Campus Crush is not a swipe/browse dating app — it's a manual-matching pilot where onboarding's *only* job is to collect a complete, safety-reviewed profile and route the user correctly on return visits. Research below is filtered through that lens: patterns from Tinder/Hinge/Bumble are relevant for form UX and photo conventions, but their matching/discovery/verification infrastructure is explicitly out of scope per PROJECT.md.

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = the onboarding feels broken or unsafe, and students abandon the form.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Auth gate before onboarding (can't see/skip the form unverified) | Every dating product requires sign-in before profile creation; students expect their photo/PII to sit behind auth, not a public form | LOW | Already decided: Supabase Google OAuth. Enforce domain allowlist server-side post-callback (client-side check alone is bypassable — see Pitfalls candidate). |
| Multi-step form with visible progress | Multi-step forms with 5 or fewer fields per screen have the highest completion rates; a progress indicator (bar/steps/dots) is expected and measurably reduces abandonment | LOW-MEDIUM | Group into logical sections: Profile (photo, demographics), Availability, Preferences. Don't expose a discouraging step count if the form is long — show meaningful section labels instead of "Step 1 of 9." |
| Back/forward navigation between steps without losing data | Users expect to review/edit an earlier step before submitting; multi-step forms without backward navigation are considered a UX flaw | LOW | Keep form state in a single client-side object (e.g. react-hook-form or local state) across all steps; only write to Supabase on final submit or per-step save. |
| Inline field validation (age, height, required fields) | Standard form UX; users expect errors surfaced next to the field, not only on submit | LOW | Age must gate 18+ (self-reported minimum is industry standard for dating apps; do not build ID verification — out of scope per PROJECT.md). Reject or block submit client- and server-side. |
| Primary photo = clear, unobstructed face shot, with explicit guidance copy | Every major dating app (Bumble, Hinge, Tinder) requires the face be clearly visible in the profile photo — "no hats, sunglasses, group shots, or heavily filtered images" is near-universal photo guidance | LOW | PROJECT.md already specifies a safety notice ("non-face photos won't be accepted"). Pair the upload control with 1-2 lines of this guidance so students self-correct before submitting, reducing manual-review rejections. |
| Single required photo (not a gallery) | Because match-making here is manual and single-sided (one face photo for review, not a swipeable gallery), only one photo is needed — this is a deliberate deviation from Tinder/Hinge/Bumble's 4-6 photo norm, which exists for swipe-based visual discovery | LOW | Do not build a multi-photo gallery — see Anti-Features. One clear face photo is sufficient for the team's manual review use case. |
| Returning-user routing: complete profile → confirmation/edit view; incomplete → resume onboarding | Users expect the app to remember where they left off — a returning authenticated user should never be shown a blank onboarding form if they already started or finished one | LOW-MEDIUM | Determine via a `profile_status` field (e.g. `not_started` / `in_progress` / `complete`) read on every authenticated page load; route accordingly. Public dating-app internals here are not well documented (proprietary), but this pattern is standard SaaS/product onboarding practice, not dating-specific. |
| Auto-save / save-and-resume across steps | Save-and-resume is shown to cut form abandonment by up to 30%; users increasingly expect not to lose progress if they close the tab mid-form | MEDIUM | Persist partial form state to Supabase (draft row, or a `profile_status = in_progress` row updated on each step) rather than only client-side storage, so resuming works across devices/sessions — important since students may start on mobile and finish on desktop. |
| Confirmation / success state after submit | Standard "what happens next" reassurance; without it users don't know if their submission succeeded or what to expect | LOW | PROJECT.md already specifies this: "you're in — we'll match you soon" + edit access. |
| Profile editing after completion | Users expect to be able to fix a typo or update availability without re-doing the whole flow | LOW-MEDIUM | Reuse the same step components in an "edit" mode pre-filled from the saved row, rather than building a second form. |
| Clear privacy/safety copy near the photo upload | Because face photos are sensitive, users expect an explicit statement of how the photo will be used/reviewed before they upload | LOW | Already required by PROJECT.md. Keep copy short, direct, non-legalistic — place it above the upload control, not buried in a modal. |

### Differentiators (Competitive Advantage)

Not required for the pilot to function, but valuable given the "more availability = more matches" incentive model and small-scale manual review.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Profile-completeness incentive copy tied to availability ("more availability = more likely to get a date") | Bumble's percentage-progress-bar pattern demonstrably nudges completion; PROJECT.md already wants this framing applied specifically to availability | LOW | Cheap to build (static copy near the availability step), disproportionately effective — directly serves the stated success metric ("usable availability data"). |
| Chip/tag input for free-text interests | Chips are the established pattern for sign-up-flow interest selection: user types, presses enter/comma to commit a removable tag, can deselect via an X | LOW-MEDIUM | Standard UX: selected items render as removable tags, remaining input stays free-text (not a fixed taxonomy) per PROJECT.md's decision to keep interests fuzzy/human-judged. Avoid building a full autocomplete-against-a-dictionary — that's over-engineering for a manual-match pilot. |
| Rolling 14-day availability calendar picker with meal-time multi-select | Distinct from any dating-app pattern (this is closer to a scheduling-tool UX, e.g. Calendly-style date grid) — no direct competitor precedent, which makes it a genuine differentiator for a food-date-specific product | MEDIUM | Render as a 14-day grid (dates as columns or rows) with B/L/D toggles per day; multi-select, not single. This is the most novel UI surface in the milestone — flag for its own UI-SPEC if not already planned. |
| Section-level save receipts ("Preferences saved") | Small trust-building touch beyond bare-minimum auto-save; reassures users mid-flow that nothing was lost | LOW | Optional polish — a toast/inline confirmation after each step-transition save. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems for a manual-matching pilot at this scale.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|------------------|-------------|
| Multi-photo gallery (4-6 photos like Tinder/Hinge/Bumble) | "That's what real dating apps do" | Those apps need multiple photos because users *browse and swipe*; this pilot has no in-app browsing (matching is manual, off-platform). More photos = more storage, more manual-review burden, more upload UX to build, for zero functional gain here | One required face photo, reviewed manually. Explicitly out of scope per PROJECT.md ("no in-app browsing"). |
| Automated face detection / liveness verification (Tinder's Face-Check-style selfie video) | Feels like the "proper" safety solution modern apps use | Meaningful engineering + third-party ML cost for a small pilot; PROJECT.md explicitly rules this out — manual review is sufficient at this scale | Manual review of the single uploaded photo by the team, gated by a private Storage bucket. Already decided. |
| Real-time in-app notifications for match/acceptance status | Feels expected in a "modern app" | Requires push infra, in-app inbox, and read-state tracking for a pilot where matching itself is manual and off-platform; disproportionate build cost | Email, sent manually by the team. Already out of scope per PROJECT.md. |
| Structured/enum-only interests (tag picker against a fixed taxonomy, like Hinge's prompt library) | Enables computable "similar interests" matching | Requires building and maintaining a taxonomy; PROJECT.md deliberately chose free-text for expressiveness, accepting fuzzy manual matching as sufficient for pilot scale | Free-text chip input; "match similar interests" is a manual/fuzzy call by the team reading the text. |
| Third-party age/ID verification (photo ID, banking data, facial age estimation) | Some regions/app stores (e.g. Google Play policy from Jan 2026) now require this for dating apps | Heavy compliance/vendor integration for a university-restricted pilot where the .edu-style domain allowlist already provides a strong proxy signal for the target population | Self-reported age with a client+server-enforced 18+ minimum, consistent with what most dating apps still do outside strict-regulation markets. Revisit only if the product moves beyond pilot/off-app-store distribution. |
| A public admin review dashboard for photo/profile approval | Feels like "the right way" to manage growing review volume | Explicitly out of scope per PROJECT.md — unnecessary build cost while the team can review rows/photos directly in the Supabase dashboard at pilot volume | Direct Supabase dashboard review (table + Storage bucket browsing). Already decided. |
| Swipe/browse/discovery UI, even a simple "view other profiles" screen | Users may expect to see who else is on the platform, dating-app-style | Directly contradicts the "matching is done manually by the team" decision; building any browse surface implies in-app matching that doesn't exist yet | Confirmation page + edit-profile view only. No browse/discovery surface at all in this milestone. |

## Feature Dependencies

```
Google OAuth sign-in (Supabase Auth)
    └──requires──> Server-side domain allowlist check
                       └──gates──> Onboarding form access

Onboarding form (Profile section)
    └──requires──> Auth session (to attach profile row to auth.uid())
    └──requires──> Private Storage bucket (photo upload target)

Onboarding form (Preferences section)
    └──enhances──> Profile section (both write to same `profiles` row)

Auto-save / save-and-resume
    └──requires──> `profile_status` field (not_started/in_progress/complete)
                       └──drives──> Returning-user routing (resume vs confirmation/edit)

Confirmation page
    └──requires──> Completed profile submission (all required fields + photo present)

Profile editing
    └──requires──> Confirmation page reached at least once
    └──reuses──> Onboarding form step components (pre-filled, same validation)

Chip/tag interest input
    └──independent of──> Rolling 14-day availability picker
    (both are Profile-section subcomponents, no shared state)

Multi-photo gallery ──conflicts──> Manual-review-at-pilot-scale decision (anti-feature)
Automated face verification ──conflicts──> Manual-review decision (anti-feature)
```

### Dependency Notes

- **Domain allowlist must gate onboarding, not just be checked client-side:** a non-university Google account could otherwise complete an onboarding form before the check fires. Enforce immediately after the OAuth callback (server-side), before any profile writes happen — the client-side "reject/sign-out" decision in PROJECT.md should be backed by a server check on submit as well, since a client redirect alone can be bypassed by disabling JS or replaying the request.
- **`profile_status` is the single source of truth for routing.** Both "resume onboarding" and "show confirmation/edit" branch on it — get this field's states right early since it determines the landing experience for every authenticated page load, not just first login.
- **Photo upload precedes photo-guidance copy in build order but they must ship together.** The upload control and the safety/guidance text are one unit of work — shipping the upload without the "your photo will be reviewed, non-face photos rejected" copy creates a support/rejection-rate problem, not just a UX gap.
- **Chip input and the availability picker have no shared state** — they can be built and tested independently, which is useful for parallelizing implementation work within the phase.

## MVP Definition

### Launch With (v1)

Minimum viable product for this milestone — what PROJECT.md's Active requirements already scope.

- [ ] Google-only sign-in via Supabase Auth — no auth without this
- [ ] Server-enforced university domain allowlist (reject/sign-out non-matching accounts) — safety/business requirement, not optional
- [ ] Onboarding form: face photo (single, with safety notice), age (18+ gate), sex, height, ethnicity, free-text interests (chip input), dating intention, availability (B/L/D + 14-day rolling dates) — this is the entire value proposition of the milestone
- [ ] Preferences: interested in, age range, ethnicity multi-select, height, "match similar interests" checkbox — required for the team to do manual matching at all
- [ ] Auto-save across steps so no data is lost mid-flow — directly protects the success metric (completed profiles)
- [ ] Confirmation page after submit
- [ ] Returning-user routing: complete → confirmation/edit; incomplete → resume where left off
- [ ] Profile editing (reuse onboarding components pre-filled)
- [ ] Private Storage bucket for photos, RLS on `profiles` table

### Add After Validation (v1.x)

Add once the pilot is running and there's real usage signal.

- [ ] Section-level save toasts / stronger "your progress is saved" reassurance — add if support questions show users doubt their data persisted
- [ ] Sharper profile-completeness messaging (e.g. a visible completion percentage, not just availability-specific copy) — add if drop-off analytics show users abandon mid-form despite auto-save
- [ ] Light client-side image guidance (crop-to-square preview, basic "face not detected" heuristic before upload) — add only if manual reviewers report a high rejection rate from obviously bad uploads; do not build ML face detection

### Future Consideration (v2+)

Defer until the pilot validates manual matching works and there's a case for scaling beyond it.

- [ ] Multi-photo profiles — only relevant if/when the product adds any in-app browsing
- [ ] Automated face/liveness verification — only relevant at a volume where manual review becomes the bottleneck
- [ ] Structured interest taxonomy for computable matching — only relevant if manual fuzzy-matching demonstrably fails to scale
- [ ] In-app match/acceptance notifications — only relevant if/when matching moves in-app

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Google OAuth + domain allowlist gating | HIGH | LOW-MEDIUM | P1 |
| Multi-step onboarding form with validation | HIGH | MEDIUM | P1 |
| Single face photo upload + safety copy | HIGH | LOW-MEDIUM | P1 |
| Availability (B/L/D + 14-day rolling picker) | HIGH | MEDIUM | P1 |
| Preferences section | HIGH | LOW | P1 |
| Auto-save / resume | HIGH | MEDIUM | P1 |
| Confirmation page | MEDIUM | LOW | P1 |
| Profile editing | MEDIUM | LOW-MEDIUM | P1 |
| Chip/tag free-text interests | MEDIUM | LOW | P1 |
| Completion-incentive copy on availability | MEDIUM | LOW | P2 |
| Save-receipt toasts | LOW | LOW | P3 |
| Multi-photo gallery | LOW (for this product) | MEDIUM-HIGH | Do not build |
| Automated face verification | LOW (for this product) | HIGH | Do not build |

**Priority key:**
- P1: Must have for launch (matches PROJECT.md Active requirements directly)
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

Framed against Tinder/Hinge/Bumble even though Campus Crush is architecturally different (no swipe/browse) — useful for form-field and photo-policy conventions, not for matching UX.

| Feature | Tinder / Hinge / Bumble | Campus Crush |
|---------|--------------------------|---------------|
| Sign-up method | Phone/Facebook/social, instant swipe access | Google-only, restricted to 5 uni domains |
| Photo count | 4-6 photos (Hinge, Bumble); onboarding optimized for speed-to-swipe | 1 required face photo (manual review, no swipe UI) |
| Face verification | Tinder: mandatory liveness Face Check (select regions, 2025+); Bumble: "Best Photo" auto-ranking | None automated — manual human review of the single photo, consistent with pilot scale |
| Profile completeness nudges | Bumble shows a live completion percentage bar | Availability-specific copy ("more availability = more matches") tied to the success metric, not a generic completeness bar |
| Onboarding pacing | Conversational: name + photo first, deeper fields deferred, users often swiping within seconds | Full profile + preferences required before any confirmation — pilot needs complete data for manual matching, so deferral isn't viable here; mitigate with auto-save + clear progress instead |
| Age handling | Self-reported birthdate, 18+ minimum, no ID check in most markets | Self-reported age, 18+ gate — consistent with industry norm; ID verification explicitly out of scope |
| Post-onboarding state | Immediately enters swipe/discovery | Confirmation page ("we'll match you soon") + edit access; no discovery surface at all |

## Sources

- [UX Onboarding Best Practices in 2025: A Designer's Guide](https://www.uxdesigninstitute.com/blog/ux-onboarding-best-practices-guide/)
- [Onboarding UX: 10 patterns, best practices, and real examples — Appcues](https://www.appcues.com/blog/user-onboarding-ui-ux-patterns)
- [UX Labyrinth: Designing the Perfect Onboarding Flow for a Dating Service — PG Dating Pro](https://www.datingpro.com/blog/ux-labyrinth-designing-the-perfect-onboarding-flow-for-a-dating-service/)
- [Onboarding Funnels That Convert: How Dating Apps Turn Signups Into Matches — SwipeTogether](https://swipetogether.com/blog/onboarding-funnels-that-convert)
- [Online Dating App Photo Dimensions: Hinge, Bumble, Tinder](https://eddie-hernandez.com/online-dating-app-photo-dimensions/)
- [Tinder, Hinge & Bumble AI Photo Policy 2026 — DatePhotos.AI](https://datephotos.ai/blog/ai-dating-photos-2026-new-rules)
- [Dating App Photo Guide: Bumble, Hinge, Men, Women](https://eddie-hernandez.com/online-dating-profile-photos-intro/)
- [Bumble Photo Guidelines 2026: Rules, Sizes & Best Practices](https://tinderprofile.ai/blog/bumble-photo-guidelines/)
- [Design a Safer Dating App UX — Toptal](https://www.toptal.com/designers/ux/safe-dating-app-ux)
- [3 Multi-Step Form Best Practices — FormAssembly](https://www.formassembly.com/blog/multi-step-form-best-practices/)
- [Must-Follow UX Best Practices When Designing A Multi Step Form — Growform](https://www.growform.co/must-follow-ux-best-practices-when-designing-a-multi-step-form/)
- [10 Best Practices for Multi-Step Form Navigation — Reform](https://www.reform.app/blog/10-best-practices-for-multi-step-form-navigation)
- [Save Form Data and Resume Later — Formstack](https://www.formstack.com/features/save-and-resume)
- [Completeness meter design pattern — UI Patterns](https://ui-patterns.com/patterns/CompletenessMeter)
- [10 dos and don'ts of UI/UX design for dating apps — Icons8/Medium](https://icons8.medium.com/10-dos-and-donts-of-ui-ux-design-for-dating-apps-9e8af58af045)
- [Multi-select Input Pattern — UX Patterns for Developers](https://uxpatterns.dev/patterns/forms/multi-select-input)
- [Chips – Material Design 3](https://m3.material.io/components/chips/guidelines)
- [Design Tinder: How to Design a Scalable Dating App — System Design Handbook](https://www.systemdesignhandbook.com/guides/design-tinder/)
- [How does age verification work? — Tinder Help](https://www.help.tinder.com/hc/en-us/articles/360040592771-How-does-age-verification-work)
- [Age Verification for Online Dating Apps — Shufti Pro](https://shuftipro.com/blog/age-verification-for-dating-apps/)
- [How to Comply with Google Play's New Dating App Age Rules — eIDAS Pro](https://eidas-pro.com/blog/google-play-dating-app-age-rules-eid)
- [Restrict Signups by Email Domain in Supabase — RapidDev](https://www.rapidevelopers.com/supabase-tutorial/how-to-allow-sign-in-only-with-specific-domains-in-supabase)
- [limiting oauth to specific emails — supabase/supabase Discussion #5088](https://github.com/supabase/supabase/discussions/5088)
- [Allow new auth user accounts from a specific email address domain — supabase/supabase Issue #6228](https://github.com/supabase/supabase/issues/6228)

---
*Feature research for: Dating-app onboarding/profile flows for a manual-matching university food-date pilot*
*Researched: 2026-08-03*
