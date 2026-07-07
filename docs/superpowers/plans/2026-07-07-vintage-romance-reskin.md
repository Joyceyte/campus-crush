# Vintage Romance Reskin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-skin the live Campus Crush site from the current navy/neon-pink Gen-Z look to the parchment/terracotta/yellow "vintage romance" direction in `specs/vintage_romance_frontend_spec.md` (rev. 2) — palette, photo grade, and texture only. Jersey 25 stays as the display font; site copy stays untouched; layout/structure/functionality stay untouched.

**Architecture:** This is a visual re-skin, not a feature build — every task edits CSS custom properties and inline `style={{...}}` colour values in existing files. No new components, no new routes, no logic changes. One task per live file (dead/unrendered files are explicitly out of scope — see below).

**Tech Stack:** Next.js 16 / React 19 / Tailwind v4, plain CSS custom properties in `app/globals.css`, inline `style` objects in components (no CSS-in-JS library, no Sass). Test tooling: `@playwright/test` only (`tests/hero.spec.ts`, `tests/bento-audit.spec.ts`) — there is no unit test runner (no Jest/Vitest) and none of these tests assert on colour, so **this plan's "test" step is a visual verification step** (run `npm run dev`, view the route, compare against the spec/inspo images) rather than a red-green unit test cycle. The two existing Playwright specs are re-run once at the end (Task 14) as a structural regression check, since they assert DOM structure/behaviour (element counts, visibility, nav background-on-scroll) that must not break.

## Global Constraints

- **Do not change any site copy** — every string of user-facing text (headlines, button labels, FAQ copy, footer links, legal text, etc.) stays byte-for-byte identical. Only `style`/CSS values change.
- **Do not touch dead/unrendered components** — `components/Matchmaker.tsx`, `components/AntiApp.tsx`, `components/SocialProof.tsx`, `components/Testimonials.tsx`, `components/AppMockup.tsx` are not imported anywhere in `app/page.tsx` or any route. Confirmed via `grep -rn "Matchmaker\|AntiApp\|SocialProof\|Testimonials\|AppMockup" app` — no import sites outside their own files. Leave them exactly as-is.
- **Do not touch `.btn-primary`, `.btn-outline`, `.stat-pill` CSS classes** in `app/globals.css` — confirmed unused by any live component (legacy ditto.ai classes per `STYLE_GUIDE.md`).
- **Jersey 25 stays** — never replace `.font-jersey` or `var(--font-jersey)` usages. Never add `background-clip`/gradient-clip text treatments (all removed, not replaced with a new gradient).
- **No `backdrop-filter` glass surfaces** anywhere in the reskinned files — replace every `backdropFilter`/`WebkitBackdropFilter` + translucent-white-fill pairing with a solid `var(--parchment-deep)` fill and an ink border instead.
- Reference doc: `specs/vintage_romance_frontend_spec.md` — read §3 (colour), §4 (type), §6 (photography) before starting if anything below is ambiguous.

### Canonical palette mapping (apply to every task below)

Add these to `app/globals.css` `:root` in Task 1, then use this table to translate every old value found in each file. Where a file needs an exception (e.g. Footer stays a dark band), the task calls it out explicitly — otherwise, apply this table mechanically.

| Old (navy/neon brand) | New (parchment/terracotta brand) |
|---|---|
| `#ffffff` / `white` (text or icon colour) | `var(--ink)` |
| `rgba(255,255,255,0.9)` | `var(--ink)` |
| `rgba(255,255,255,0.85)` / `0.8` / `0.82` | `rgba(43,27,18,0.85)` |
| `rgba(255,255,255,0.75)` / `0.72` / `0.7` | `rgba(43,27,18,0.75)` |
| `rgba(255,255,255,0.66)` / `0.65` / `0.6` | `rgba(43,27,18,0.66)` |
| `rgba(255,255,255,0.55)` / `0.5` | `rgba(43,27,18,0.55)` |
| `rgba(255,255,255,0.45)` / `0.4` | `rgba(43,27,18,0.45)` |
| `#ff1f71` (any: text/border/icon/glow) | `var(--terracotta)` |
| `rgba(255,31,113,X)` (glow/tint/border, any opacity X) | `rgba(193,81,47,X)` — same opacity, new base colour |
| `var(--navy-dark)` / `#0a1628` / `#081721` / `#0f2044` as a **page/section background** | `var(--parchment)` |
| `var(--navy-dark)` / similar as a **card/pill/modal fill sitting on parchment** | `var(--parchment-deep)` |
| `rgba(8,18,40,0.82)` / `rgba(6,12,22,0.3)` (dark photo overlay) | `rgba(247,239,225,0.35)` |
| `linear-gradient(180deg, rgba(6,12,22,0.45) 0%, rgba(6,12,22,0.62) 100%)` (light scrim) | `linear-gradient(180deg, rgba(247,239,225,0.42) 0%, rgba(247,239,225,0.6) 100%)` |
| `linear-gradient(180deg, rgba(6,12,22,0.55) 0%, rgba(6,12,22,0.72) 100%)` (heavy scrim) | `linear-gradient(180deg, rgba(247,239,225,0.55) 0%, rgba(247,239,225,0.75) 100%)` |
| `linear-gradient(135deg, #ffffff 55%, #ff1f71 100%)` + `WebkitBackgroundClip`/`backgroundClip: 'text'` + `WebkitTextFillColor: 'transparent'` (gradient-clip headline, 4 properties together) | Delete all 4 properties; add `color: 'var(--terracotta)'` |
| `rgba(255,255,255,0.07)` / `0.08` / `0.1` / `0.12` (translucent glass fill) | `var(--parchment-deep)` — and delete any `backdropFilter`/`WebkitBackdropFilter` on the same element |
| `rgba(255,255,255,0.14)` / `0.15` / `0.18` / `0.2` (translucent border) | `rgba(43,27,18,0.18)` |
| `accentColor: '#ff1f71'` | `accentColor: 'var(--terracotta)'` |
| `border: '1px solid rgba(255,255,255,0.08)'` (hairline) | `border: '1px solid rgba(43,27,18,0.14)'` |

---

### Task 1: Global tokens, base styles, shared classes

**Files:**
- Modify: `app/globals.css:7-71` (`:root` tokens), `:86-93` (`body`), `:198-265` (`.stat-pill` — skip, out of scope), `:252-265` (`.section-label`), `:286-297` (`spotPulse` keyframe + `.wiggle-text`), `:412-450` (`.bento-tile` + `img` filter), `:459-518` (`.neon-btn`, `.grain`, `.grain-heavy`), `:220-250` (`.glass-btn`)

**Interfaces:**
- Produces: new CSS custom properties consumed by every later task — `var(--parchment)`, `var(--parchment-deep)`, `var(--ink)`, `var(--terracotta)`, `var(--yellow)`, `var(--burgundy)`, `var(--rose)`.

- [ ] **Step 1: Add the new palette tokens to `:root`**

In `app/globals.css`, after the existing `/* Navy color scheme */` block (lines 67-70), add:

```css
  /* Vintage romance palette (rev. 2 — parchment/terracotta/yellow) */
  --parchment: #F7EFE1;
  --parchment-deep: #EFE3CD;
  --ink: #2B1B12;
  --terracotta: #C1512F;
  --yellow: #E8B23D;
  --burgundy: #6E1F2B;
  --rose: #D48C82;
```

Leave `--navy-dark`, `--navy-mid`, `--navy-light` in place (unused by any live file after this plan, still referenced by the out-of-scope dead components — removing them would be free but not required).

- [ ] **Step 2: Repoint body background and text colour**

Change:
```css
body {
  background-color: #081721;
  color: var(--text);
```
to:
```css
body {
  background-color: var(--parchment);
  color: var(--ink);
```
(Drop `var(--text)` — it pointed at a legacy Nu-scale colour close to but not exactly the new ink; use the new token directly for clarity.)

- [ ] **Step 3: Re-theme `.section-label`**

Change the block at lines 252-265 from white-on-translucent-white to ink-on-parchment-deep:
```css
.section-label {
  display: inline-block;
  background: var(--parchment-deep);
  border: 1px solid rgba(43,27,18,0.18);
  border-radius: 9999px;
  padding: 0.35rem 1rem;
  font-family: var(--font-jersey), 'Jersey 25', monospace;
  font-size: 0.8rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(43,27,18,0.85);
  margin-bottom: 1.25rem;
}
```

- [ ] **Step 4: Re-theme `spotPulse` keyframe (terracotta glow, not pink)**

Change:
```css
@keyframes spotPulse {
  0%   { transform: scale(1);    text-shadow: 0 0 12px rgba(255,31,113,0.5); }
  40%  { transform: scale(1.08); text-shadow: 0 0 22px rgba(255,31,113,0.85); }
  100% { transform: scale(1);    text-shadow: 0 0 12px rgba(255,31,113,0.5); }
}
```
to:
```css
@keyframes spotPulse {
  0%   { transform: scale(1);    text-shadow: 0 0 12px rgba(193,81,47,0.5); }
  40%  { transform: scale(1.08); text-shadow: 0 0 22px rgba(193,81,47,0.85); }
  100% { transform: scale(1);    text-shadow: 0 0 12px rgba(193,81,47,0.5); }
}
```

- [ ] **Step 5: Re-theme the bento photo tile overlay and filter (faded, not dark-desaturated)**

Change:
```css
.bento-tile::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background: rgba(6, 12, 22, 0.3);
}
.bento-tile img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 40%;
  /* Grayed (desaturated) look, NO blur. */
  filter: saturate(0.82) brightness(0.9);
}
```
to:
```css
.bento-tile::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background: rgba(247, 239, 225, 0.12);
}
.bento-tile img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 40%;
  /* Faded, sun-bleached look (spec §6), NO blur. */
  filter: saturate(0.72) brightness(1.1) contrast(0.9) sepia(0.14);
}
```

- [ ] **Step 6: Lighten `.grain-heavy` to a paper-fiber texture**

Change only the opacity in the `.grain-heavy::after` rule (keep the existing SVG data URI untouched — do not hand-edit the encoded SVG string):
```css
  opacity: 0.85;
  mix-blend-mode: multiply;
}
```
(the block starting at line ~505) to:
```css
  opacity: 0.08;
  mix-blend-mode: multiply;
}
```
Also reduce `.grain::after`'s opacity from `0.20` to `0.12` for consistency (same rule, just the `opacity` line in the `.grain::after` block).

- [ ] **Step 7: Re-theme `.neon-btn` into the wax-seal primary CTA**

Change:
```css
.neon-btn {
  background: #ffffff;
  color: #ff1f71;
  font-family: var(--font-jersey), 'Jersey 25', monospace;
  font-weight: 400;
  letter-spacing: 0.1em;
  border-radius: 9999px;
  padding: 0.75rem 2rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  border: none;
  min-height: 44px;
  font-size: inherit;
  text-shadow: 0 0 12px rgba(255,31,113,0.45);
  box-shadow: 0 4px 20px rgba(255,31,113,0.25), inset 0 1px 0 rgba(255,255,255,0.8);
  transition: box-shadow 0.2s, transform 0.15s;
}
.neon-btn:hover {
  box-shadow: 0 8px 30px rgba(255,31,113,0.4), inset 0 1px 0 rgba(255,255,255,0.8);
  transform: translateY(-1px);
}
```
to:
```css
.neon-btn {
  background: var(--terracotta);
  color: var(--parchment);
  font-family: var(--font-jersey), 'Jersey 25', monospace;
  font-weight: 400;
  letter-spacing: 0.1em;
  border-radius: 9999px;
  padding: 0.75rem 2rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  border: none;
  min-height: 44px;
  font-size: inherit;
  box-shadow: 0 4px 20px rgba(193,81,47,0.28), inset 0 1px 0 rgba(255,255,255,0.18);
  transition: box-shadow 0.2s, transform 0.15s;
}
.neon-btn:hover {
  box-shadow: 0 8px 30px rgba(193,81,47,0.4), inset 0 1px 0 rgba(255,255,255,0.18);
  transform: translateY(-1px);
}
.neon-btn:active {
  transform: scale(0.96);
}
```
(Dropped the pink `text-shadow` glow; added a wax-seal `:active` press per spec §7/§8.)

- [ ] **Step 8: Re-theme `.glass-btn` into an ink-outline secondary button (no backdrop-filter)**

Change:
```css
.glass-btn {
  background: linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 100%);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255,255,255,0.35);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.45),
    inset 0 -1px 0 rgba(0,0,0,0.08),
    0 8px 32px rgba(0,0,0,0.18);
  color: white;
  font-family: var(--font-jersey), 'Jersey 25', monospace;
  font-weight: 400;
  letter-spacing: 0.08em;
  border-radius: 9999px;
  padding: 0.75rem 2rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s, transform 0.15s;
  min-height: 44px;
}
.glass-btn:hover {
  background: linear-gradient(135deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.12) 100%);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.55),
    inset 0 -1px 0 rgba(0,0,0,0.08),
    0 12px 40px rgba(0,0,0,0.22);
  transform: translateY(-1px);
}
```
to:
```css
.glass-btn {
  background: transparent;
  border: 1.5px solid rgba(43,27,18,0.35);
  color: var(--ink);
  font-family: var(--font-jersey), 'Jersey 25', monospace;
  font-weight: 400;
  letter-spacing: 0.08em;
  border-radius: 9999px;
  padding: 0.75rem 2rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
  min-height: 44px;
}
.glass-btn:hover {
  background: rgba(43,27,18,0.06);
  transform: translateY(-1px);
}
```

- [ ] **Step 9: Visual check (no unit test framework applies to CSS tokens)**

Run: `npm run dev`
Visit `http://localhost:3000` — the page will look broken/inconsistent until later tasks land (components still hardcode old colours), but confirm in devtools that `getComputedStyle(document.body).backgroundColor` is `rgb(247, 239, 225)` and no console errors appear from the CSS change itself.

- [ ] **Step 10: Commit**

```bash
git add app/globals.css
git commit -m "style: re-theme global tokens and shared classes to parchment/terracotta palette"
```

---

### Task 2: Navbar.tsx

**Files:**
- Modify: `components/Navbar.tsx:26-29`

**Interfaces:**
- Consumes: `var(--parchment)`, `rgba(43,27,18,...)` tokens from Task 1.

- [ ] **Step 1: Re-theme the scrolled nav background/border**

Change:
```tsx
        background: scrolled ? "rgba(8,16,30,0.72)" : "transparent",
        backdropFilter: scrolled ? "blur(16px) saturate(160%)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(16px) saturate(160%)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
```
to:
```tsx
        background: scrolled ? "rgba(247,239,225,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(16px) saturate(160%)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(16px) saturate(160%)" : "none",
        borderBottom: scrolled ? "1px solid rgba(43,27,18,0.14)" : "1px solid transparent",
```
(Keep the blur — this is a legibility scrim over content scrolling underneath, not a "glass card" surface, so it's not covered by the no-backdrop-filter rule in Global Constraints. `tests/hero.spec.ts`'s "navbar is transparent at top" / "navbar blurs on scroll" tests check *presence/absence* of a background colour, not which colour — this change keeps both passing.)

- [ ] **Step 2: Visual check**

Run: `npm run dev`, visit `/`, scroll down 100px, confirm the nav bar shows a warm parchment translucent bar with a thin ink hairline instead of a navy one. Logo and button styling come from `.glass-btn`/`.neon-btn` (Task 1) and the logo image itself (unchanged).

- [ ] **Step 3: Commit**

```bash
git add components/Navbar.tsx
git commit -m "style: re-theme Navbar scrolled state to parchment"
```

---

### Task 3: Hero.tsx

**Files:**
- Modify: `components/Hero.tsx:111` (eyebrow), `:120` (rotating phrase text colour is via Tailwind `text-white/90`, needs a class swap), `:133` (`this winter` label), `:138-151` ("Launching at..." paragraph), `:174-184` (spots-left number/label), `:207-220` (Fold 2 section bg + eyebrow inline override), `:225-259` (step cards)

**Interfaces:**
- Consumes: Task 1 tokens.

- [ ] **Step 1: Hero panel eyebrow/phrase/label — swap Tailwind white utilities for ink**

Change (line 111):
```tsx
              className="font-jersey text-[clamp(1rem,3vw,1.5rem)] tracking-[0.3em] uppercase text-white/60"
```
to:
```tsx
              className="font-jersey text-[clamp(1rem,3vw,1.5rem)] tracking-[0.3em] uppercase text-[#2B1B12]/60"
```

Change (line 120):
```tsx
                className="font-jersey text-[clamp(3rem,7vw,4.5rem)] text-white/90"
```
to:
```tsx
                className="font-jersey text-[clamp(3rem,7vw,4.5rem)] text-[#2B1B12]/90"
```
Also on the same element, the inline `textShadow: "0 2px 24px rgba(0,0,0,0.55)"` (line 125) was there to lift white text off a dark photo — with the ink text now sitting on a light parchment desktop panel (and a lightened photo on mobile, Step 3 below), drop it:
```tsx
                  textShadow: "0 2px 24px rgba(0,0,0,0.55)",
```
→ delete this line entirely.

Change (line 133):
```tsx
            <p className="font-jersey text-[clamp(0.75rem,2vw,1rem)] tracking-[0.3em] uppercase text-white/45 mt-3">
```
to:
```tsx
            <p className="font-jersey text-[clamp(0.75rem,2vw,1rem)] tracking-[0.3em] uppercase text-[#2B1B12]/45 mt-3">
```

- [ ] **Step 2: "Launching at University of Melbourne" paragraph**

Change (line 143):
```tsx
            color: '#ffffff',
```
to:
```tsx
            color: 'var(--ink)',
```

- [ ] **Step 3: Mobile photo-hero panel background wash (desktop `background: none` stays)**

In `app/globals.css` (already touched in Task 1's file, but this specific rule lives in the `.hero-panel` block at lines 350-355 — do it here since it's Hero-specific content, not a shared class other files use):

Change:
```css
  background-image:
    linear-gradient(180deg, rgba(8, 18, 40, 0.5) 0%, rgba(8, 18, 40, 0.66) 100%),
    url("/blurry-iceskating.jpeg");
```
to:
```css
  background-image:
    linear-gradient(180deg, rgba(247, 239, 225, 0.5) 0%, rgba(247, 239, 225, 0.7) 100%),
    url("/blurry-iceskating.jpeg");
```
Also add the same faded-photo filter used on bento tiles so the mobile hero photo matches: on the `.hero-panel` rule, `background-size: cover;` stays, but add:
```css
  background-blend-mode: normal;
```
is unnecessary — skip it; the linear-gradient wash alone (now parchment-toned instead of navy) is sufficient to keep ink text legible, consistent with how `.bento-tile img`'s filter (Task 1 Step 5) lightens the same photo elsewhere.

- [ ] **Step 4: Spots-left number and label**

Change (lines 174, 176):
```tsx
                        color: '#ff1f71',
                        fontVariantNumeric: 'tabular-nums',
                        textShadow: '0 0 12px rgba(255,31,113,0.5)',
```
to:
```tsx
                        color: 'var(--terracotta)',
                        fontVariantNumeric: 'tabular-nums',
                        textShadow: '0 0 12px rgba(193,81,47,0.5)',
```

Change (line 182):
```tsx
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)' }}>
```
to:
```tsx
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(43,27,18,0.85)' }}>
```

- [ ] **Step 5: Fold 2 ("How It Works") section background + eyebrow**

Change (line 210):
```tsx
          background: "var(--navy-dark)",
```
to:
```tsx
          background: "var(--parchment)",
```

Change (line 217):
```tsx
          style={{ color: '#ff1f71', borderColor: 'rgba(255,31,113,0.35)', background: 'rgba(255,31,113,0.10)' }}
```
to:
```tsx
          style={{ color: 'var(--terracotta)', borderColor: 'rgba(193,81,47,0.35)', background: 'rgba(193,81,47,0.10)' }}
```

- [ ] **Step 6: Step cards (dark glass → parchment-deep paper cards)**

Change (lines 228-231):
```tsx
                  background: "rgba(0,0,0,0.55)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  border: "1px solid rgba(255,255,255,0.12)",
```
to:
```tsx
                  background: "var(--parchment-deep)",
                  border: "1px solid rgba(43,27,18,0.14)",
```
(Delete the two `backdropFilter` lines entirely — no-glass rule.)

Change (lines 246-247, the step number):
```tsx
                    color: "#ff1f71",
                    textShadow: "0 0 20px rgba(255,31,113,0.6), 0 0 40px rgba(255,31,113,0.3)",
```
to:
```tsx
                    color: "var(--terracotta)",
                    textShadow: "0 0 20px rgba(193,81,47,0.35), 0 0 40px rgba(193,81,47,0.18)",
```

Change (line 254):
```tsx
                <h3 className="font-jersey" style={{ fontSize: "1.2rem", letterSpacing: "0.08em", color: "#ffffff", lineHeight: 1.2 }}>
```
to:
```tsx
                <h3 className="font-jersey" style={{ fontSize: "1.2rem", letterSpacing: "0.08em", color: "var(--ink)", lineHeight: 1.2 }}>
```

Change (line 257):
```tsx
                <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.72)", lineHeight: 1.7 }}>
```
to:
```tsx
                <p style={{ fontSize: "0.78rem", color: "rgba(43,27,18,0.75)", lineHeight: 1.7 }}>
```

- [ ] **Step 7: Visual check**

Run: `npm run dev`, visit `/`. Confirm: hero text reads in ink over the parchment desktop panel / lightened photo on mobile; the "spots left" number is terracotta; the "How It Works" fold has a parchment background with three paper-toned step cards.

- [ ] **Step 8: Run the existing Hero Playwright spec**

Run: `npx playwright test tests/hero.spec.ts`
Expected: all tests still PASS — none of them assert colour, only structure/text/visibility/behaviour, which this task didn't touch.

- [ ] **Step 9: Commit**

```bash
git add components/Hero.tsx app/globals.css
git commit -m "style: re-theme Hero to parchment/terracotta, fade mobile hero photo wash"
```

---

### Task 4: WhyUs.tsx

**Files:**
- Modify: `components/WhyUs.tsx` (photo backdrop scrim, gradient-clip headlines ×2, all white/rgba text, match card, feature icon pills)

**Interfaces:**
- Consumes: Task 1 tokens.

- [ ] **Step 1: Backdrop scrim (line 66)**

Change:
```tsx
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(6,12,22,0.45) 0%, rgba(6,12,22,0.62) 100%)" }} />
```
to:
```tsx
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(247,239,225,0.55) 0%, rgba(247,239,225,0.75) 100%)" }} />
```
Also give the backdrop `<img>` (line 59-64) the same faded filter as `.bento-tile img` — add a `filter` entry to its style object:
```tsx
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "blur(3px) saturate(0.72) brightness(1.1) contrast(0.9) sepia(0.14)", transform: "scale(1.06)", opacity: 1 }}
```
(This is the pattern to repeat in every other component that has an identical full-bleed blurred backdrop `<img>` — PrivateSafe, FAQ, FinalCTA below.)

- [ ] **Step 2: First gradient-clip headline "Tired of Tinder and Hinge" (lines 80-84)**

Change:
```tsx
                background: "linear-gradient(135deg, #ffffff 55%, #ff1f71 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
```
to:
```tsx
                color: "var(--terracotta)",
              }}
```

- [ ] **Step 3: Body text under it (line 91)**

Change `color: "rgba(255,255,255,0.80)"` to `color: "rgba(43,27,18,0.80)"`.

- [ ] **Step 4: Notification chaos cards (lines 119, 137, 148)**

Change:
```tsx
                  background: "rgba(8,18,40,0.85)",
```
to:
```tsx
                  background: "var(--parchment-deep)",
```
Change (line 137, app name text): `color: "#ffffff"` → `color: "var(--ink)"`.
Change (line 148, notification body text): `color: "rgba(255,255,255,0.6)"` → `color: "rgba(43,27,18,0.6)"`.
(Leave `borderLeft: '3px solid ${n.color}'` and the emoji/app-name literal colors `#FF4458`/`#9933CC` untouched — those represent the *other* apps' brand colours being mocked, not this site's palette, and are unaffected by the reskin.)

- [ ] **Step 5: Second gradient-clip headline "Your Matchmaker" (lines 179-183)**

Same change as Step 2:
```tsx
                background: "linear-gradient(135deg, #ffffff 55%, #ff1f71 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
```
to:
```tsx
                color: "var(--terracotta)",
              }}
```
And its body text (line 190): `color: "rgba(255,255,255,0.80)"` → `color: "rgba(43,27,18,0.80)"`.

- [ ] **Step 6: Match card ("It's a Match!")**

Change card background/border (lines 209-215):
```tsx
              background: "linear-gradient(180deg, rgba(20,30,52,0.92), rgba(10,16,30,0.92))",
              border: "1px solid rgba(255,31,113,0.45)",
              borderRadius: "1.75rem",
              padding: "1.9rem 1.6rem 1.6rem",
              overflow: "hidden",
              boxShadow:
                "0 24px 70px rgba(0,0,0,0.55), 0 0 40px rgba(255,31,113,0.18), inset 0 1px 0 rgba(255,255,255,0.06)",
```
to:
```tsx
              background: "var(--parchment-deep)",
              border: "1px solid rgba(193,81,47,0.35)",
              borderRadius: "1.75rem",
              padding: "1.9rem 1.6rem 1.6rem",
              overflow: "hidden",
              boxShadow: "0 24px 70px rgba(43,27,18,0.18), inset 0 1px 0 rgba(255,255,255,0.4)",
```

Change "Match found" ping (lines 229-230): `color: "#ff1f71"`, `textShadow: "0 0 12px rgba(255,31,113,0.6)"` → `color: "var(--terracotta)"`, `textShadow: "0 0 10px rgba(193,81,47,0.35)"`.

Change avatar border (line 248): `border: "3px solid rgba(255,255,255,0.9)"` → `border: "3px solid var(--parchment)"`.

Change heart badge (lines 261, 266-267):
```tsx
                  background: "#fff",
```
→
```tsx
                  background: "var(--parchment)",
```
and
```tsx
                  color: "#ff1f71",
                  boxShadow: "0 6px 18px rgba(255,31,113,0.5)",
```
→
```tsx
                  color: "var(--terracotta)",
                  boxShadow: "0 6px 18px rgba(193,81,47,0.35)",
```

Change footer-logo avatar border (line 283): `border: "3px solid #ff1f71"` → `border: "3px solid var(--terracotta)"`.

Change "It's a Match!" text (lines 297-298): `color: "#fff"`, `textShadow: "0 0 18px rgba(255,31,113,0.45)"` → `color: "var(--ink)"`, and delete the `textShadow` line (no glow needed on a light card).

Change the description under it (line 304): `color: "rgba(255,255,255,0.72)"` → `color: "rgba(43,27,18,0.72)"`.

Change "Reasons you match" label (line 314): `color: "rgba(255,255,255,0.55)"` → `color: "rgba(43,27,18,0.55)"`.

Change feature row border (line 329): `borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.08)"` → `"1px solid rgba(43,27,18,0.12)"`.

Change feature icon pill (lines 339-340):
```tsx
                    background: "rgba(255,31,113,0.14)",
                    border: "1px solid rgba(255,31,113,0.3)",
```
→
```tsx
                    background: "rgba(193,81,47,0.12)",
                    border: "1px solid rgba(193,81,47,0.3)",
```

Change feature title/desc (lines 349, 352): `color: "#fff"` → `color: "var(--ink)"`; `color: "rgba(255,255,255,0.66)"` → `color: "rgba(43,27,18,0.66)"`.

- [ ] **Step 7: Visual check**

Run: `npm run dev`, visit `/`, scroll to the "Tired of Tinder and Hinge" / "Your Matchmaker" section. Confirm both headlines render solid terracotta (no gradient), the match card is a parchment-deep "letter" card, and the backdrop photo reads faded rather than dark.

- [ ] **Step 8: Commit**

```bash
git add components/WhyUs.tsx
git commit -m "style: re-theme WhyUs to parchment/terracotta"
```

---

### Task 5: PrivateSafe.tsx

**Files:**
- Modify: `components/PrivateSafe.tsx:48-51` (backdrop img filter), `:51` (scrim), `:66-80` (gradient-clip headline), `:94-118` (feature columns)

- [ ] **Step 1: Backdrop image + scrim (lines 48, 51)**

Same pattern as WhyUs Step 1 — add the faded filter to the `filter` value (`"blur(3px) saturate(0.72) brightness(1.1) contrast(0.9) sepia(0.14)"`), and change the scrim:
```tsx
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(6,12,22,0.55) 0%, rgba(6,12,22,0.72) 100%)" }} />
```
to:
```tsx
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(247,239,225,0.6) 0%, rgba(247,239,225,0.8) 100%)" }} />
```

- [ ] **Step 2: Gradient-clip headline "Private & Safe" (lines 73-77)**

Same removal pattern as WhyUs:
```tsx
              background: "linear-gradient(135deg, #ffffff 55%, #ff1f71 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
```
to:
```tsx
              color: "var(--terracotta)",
            }}
```

- [ ] **Step 3: Feature columns (lines 94, 104, 112)**

Change `color: "#ffffff"` (line 94, the column wrapper) → `color: "var(--ink)"`.
Change `color: "#ffffff"` (line 104, the `<h3>`) → `color: "var(--ink)"`.
Change `color: "rgba(255,255,255,0.75)"` (line 112, the `<p>`) → `color: "rgba(43,27,18,0.75)"`.

(The Twemoji `<img>` icons themselves are unaffected — they're full-colour PNGs, not tinted by CSS `color`.)

- [ ] **Step 4: Visual check**

Run: `npm run dev`, visit `/`, scroll to "Private & Safe". Confirm solid terracotta headline, ink body/feature text on the now-lightened photo backdrop.

- [ ] **Step 5: Commit**

```bash
git add components/PrivateSafe.tsx
git commit -m "style: re-theme PrivateSafe to parchment/terracotta"
```

---

### Task 6: FAQ.tsx

**Files:**
- Modify: `components/FAQ.tsx:51-72` (backdrop, scrim, gradient-clip headline), `:78-111` (glass container → paper card), `:120-150` (chevron, divider, answer text)

- [ ] **Step 1: Backdrop image filter + scrim (lines 51-57)**

Same pattern as prior tasks: add the faded filter to the backdrop `<img>`'s `filter` value, and change the scrim:
```tsx
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(6,12,22,0.55) 0%, rgba(6,12,22,0.72) 100%)" }} />
```
to:
```tsx
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(247,239,225,0.6) 0%, rgba(247,239,225,0.8) 100%)" }} />
```

- [ ] **Step 2: Gradient-clip headline "Everything you need to know" (lines 68-71)**

Same removal pattern:
```tsx
            background: "linear-gradient(135deg, #ffffff 55%, #ff1f71 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
```
to:
```tsx
            color: "var(--terracotta)",
          }}
```

- [ ] **Step 3: FAQ container — glass → paper card (lines 79-84)**

Change:
```tsx
            background: "rgba(255,255,255,0.07)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.15)",
```
to:
```tsx
            background: "var(--parchment-deep)",
            border: "1px solid rgba(43,27,18,0.14)",
```

- [ ] **Step 4: Divider, question text, chevron, answer text**

Change divider (line 92): `borderTop: "1px solid rgba(255,255,255,0.10)"` → `"1px solid rgba(43,27,18,0.12)"`.
Change question text (line 111): `color: "#ffffff"` → `color: "var(--ink)"`.
Change chevron stroke (line 120): `stroke="rgba(255,255,255,0.55)"` → `stroke="rgba(43,27,18,0.55)"`.
Change answer text (line 150): `color: "rgba(255,255,255,0.70)"` → `color: "rgba(43,27,18,0.72)"`.

- [ ] **Step 5: Visual check**

Run: `npm run dev`, visit `/`, scroll to the FAQ section. Confirm the accordion is now a parchment-deep paper card with ink text and no blur/glass effect, and open/close still animates correctly (grid-rows transition is untouched).

- [ ] **Step 6: Commit**

```bash
git add components/FAQ.tsx
git commit -m "style: re-theme FAQ to parchment paper card, drop glass blur"
```

---

### Task 7: FinalCTA.tsx

**Files:**
- Modify: `components/FinalCTA.tsx:21-33` (backdrop filter, scrim), `:45-49` (gradient-clip headline), `:53-56` (body text)

- [ ] **Step 1: Backdrop image filter + scrim**

Same pattern: add the faded filter to the `<img>` at lines 17-31, and change the scrim (line 33):
```tsx
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(6,12,22,0.45) 0%, rgba(6,12,22,0.62) 100%)" }} />
```
to:
```tsx
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(247,239,225,0.5) 0%, rgba(247,239,225,0.7) 100%)" }} />
```

- [ ] **Step 2: Gradient-clip headline "Date Without Swiping." (lines 45-48)**

Same removal pattern:
```tsx
            background: "linear-gradient(135deg, #ffffff 55%, #ff1f71 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
```
to:
```tsx
            color: "var(--terracotta)",
          }}
```

- [ ] **Step 3: Body copy (lines 53, 55)**

Change:
```tsx
        <p style={{ fontSize: '0.875rem', maxWidth: '34ch', margin: '0 auto 2rem', color: 'rgba(255,255,255,0.60)', lineHeight: 1.7 }}>
          Join the waitlist and be the first to know when Campus Crush launches at{' '}
          <span style={{ color: '#ffffff', fontWeight: 600 }}>the University of Melbourne</span>.
        </p>
```
to:
```tsx
        <p style={{ fontSize: '0.875rem', maxWidth: '34ch', margin: '0 auto 2rem', color: 'rgba(43,27,18,0.66)', lineHeight: 1.7 }}>
          Join the waitlist and be the first to know when Campus Crush launches at{' '}
          <span style={{ color: 'var(--ink)', fontWeight: 600 }}>the University of Melbourne</span>.
        </p>
```

- [ ] **Step 4: Visual check**

Run: `npm run dev`, visit `/`, scroll to the final CTA. Confirm solid terracotta headline, ink body copy, faded photo backdrop.

- [ ] **Step 5: Commit**

```bash
git add components/FinalCTA.tsx
git commit -m "style: re-theme FinalCTA to parchment/terracotta"
```

---

### Task 8: BlogPreview.tsx

**Files:**
- Modify: `components/BlogPreview.tsx:19` (section bg), `:32-36` (gradient-clip headline), `:44` (body text), `:73-87` (post cards)

- [ ] **Step 1: Section background (line 19)**

Change `background: "var(--navy-dark)"` to `background: "var(--parchment)"`.

- [ ] **Step 2: Gradient-clip headline "Read Before Your First Date" (lines 32-35)**

Same removal pattern:
```tsx
            background: "linear-gradient(135deg, #ffffff 55%, #ff1f71 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
```
to:
```tsx
            color: "var(--terracotta)",
          }}
```

- [ ] **Step 3: Intro paragraph (line 44)**

Change `color: "rgba(255,255,255,0.7)"` to `color: "rgba(43,27,18,0.7)"`.

- [ ] **Step 4: Post cards (lines 73-87)**

Change:
```tsx
                border: "1px solid rgba(255,31,113,0.35)",
                background: "linear-gradient(180deg, rgba(20,30,52,0.6), rgba(10,16,30,0.6))",
```
to:
```tsx
                border: "1px solid rgba(193,81,47,0.3)",
                background: "var(--parchment-deep)",
```
Change post date (line 78): `color: "rgba(255,255,255,0.5)"` → `color: "rgba(43,27,18,0.5)"`.
Change post title (line 81): `color: "#fff"` → `color: "var(--ink)"`.
Change post excerpt (line 84): `color: "rgba(255,255,255,0.72)"` → `color: "rgba(43,27,18,0.72)"`.
Change "Read more →" (line 87): `color: "#ff1f71"` → `color: "var(--terracotta)"`.

- [ ] **Step 5: Visual check**

Run: `npm run dev`, visit `/`, scroll to "Read Before Your First Date". Confirm parchment background, terracotta headline, three paper-toned post cards, and that the "View all posts" `.glass-btn` link (unchanged by this task — already re-themed in Task 1) reads correctly on the parchment section.

- [ ] **Step 6: Commit**

```bash
git add components/BlogPreview.tsx
git commit -m "style: re-theme BlogPreview to parchment/terracotta"
```

---

### Task 9: Footer.tsx (exception — stays a dark band per spec §3)

**Files:**
- Modify: `components/Footer.tsx:5-6`, `:37-47`

The spec (`specs/vintage_romance_frontend_spec.md` §3) explicitly keeps deep burgundy for "hover states, deep depth colour, **footer band**" — so this file does **not** follow the generic ink-on-parchment mapping. It flips: light parchment-toned text on a dark burgundy background, mirroring the current white-on-navy pattern but with the new dark colour.

- [ ] **Step 1: Section background + border**

Change:
```tsx
        background: "var(--navy-dark)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
```
to:
```tsx
        background: "var(--burgundy)",
        borderTop: "1px solid rgba(247,239,225,0.14)",
```

- [ ] **Step 2: Footer nav links**

Change all four instances of `color: "rgba(255,255,255,0.55)"` (Blog, Privacy, Contact, Instagram links, lines 37-47) to `color: "rgba(247,239,225,0.75)"`.

- [ ] **Step 3: Visual check**

Run: `npm run dev`, visit `/`, scroll to the footer. Confirm a deep burgundy band (not navy, not parchment) with legible warm-cream-toned links — this is the one section that stays dark, by design.

- [ ] **Step 4: Commit**

```bash
git add components/Footer.tsx
git commit -m "style: re-theme Footer to deep burgundy band per spec"
```

---

### Task 10: WaitlistModal.tsx

**Files:**
- Modify: `components/WaitlistModal.tsx:80-124` (shared style objects), `:153` (modal bg), `:172-181` (close button), `:195-233` (success + form headers), `:256-274` (select dropdown), `:276-337` (errors), `:341-354` (submit button, class-driven, no change needed)

- [ ] **Step 1: Shared style objects (`inputStyle`, `labelStyle`, `consentLabelStyle`, `consentCheckboxStyle`, `consentLinkStyle`, lines 80-124)**

Change:
```tsx
  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: "0.75rem",
    padding: "0.85rem 1rem",
    width: "100%",
    color: "white",
    fontSize: "0.9rem",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "Helvetica, Arial, sans-serif",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.65rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.50)",
    marginBottom: "0.4rem",
  };

  const consentLabelStyle: React.CSSProperties = {
    display: "flex",
    gap: "0.6rem",
    alignItems: "flex-start",
    fontSize: "0.72rem",
    lineHeight: 1.55,
    color: "rgba(255,255,255,0.60)",
    cursor: "pointer",
  };

  const consentCheckboxStyle: React.CSSProperties = {
    marginTop: "0.15rem",
    width: "1rem",
    height: "1rem",
    flexShrink: 0,
    accentColor: "#ff1f71",
    cursor: "pointer",
  };

  const consentLinkStyle: React.CSSProperties = {
    color: "#ffffff",
    textDecoration: "underline",
  };
```
to:
```tsx
  const inputStyle: React.CSSProperties = {
    background: "var(--parchment)",
    border: "1px solid rgba(43,27,18,0.22)",
    borderRadius: "0.75rem",
    padding: "0.85rem 1rem",
    width: "100%",
    color: "var(--ink)",
    fontSize: "0.9rem",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "Helvetica, Arial, sans-serif",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.65rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "rgba(43,27,18,0.55)",
    marginBottom: "0.4rem",
  };

  const consentLabelStyle: React.CSSProperties = {
    display: "flex",
    gap: "0.6rem",
    alignItems: "flex-start",
    fontSize: "0.72rem",
    lineHeight: 1.55,
    color: "rgba(43,27,18,0.66)",
    cursor: "pointer",
  };

  const consentCheckboxStyle: React.CSSProperties = {
    marginTop: "0.15rem",
    width: "1rem",
    height: "1rem",
    flexShrink: 0,
    accentColor: "var(--terracotta)",
    cursor: "pointer",
  };

  const consentLinkStyle: React.CSSProperties = {
    color: "var(--ink)",
    textDecoration: "underline",
  };
```

- [ ] **Step 2: Modal card background (line 153)**

Change:
```tsx
          background: "#0f2044",
          border: "1px solid rgba(255,255,255,0.15)",
```
to:
```tsx
          background: "var(--parchment-deep)",
          border: "1px solid rgba(43,27,18,0.16)",
```
Also update the box-shadow (line 156) from `"0 25px 60px rgba(0,0,0,0.55)"` to `"0 25px 60px rgba(43,27,18,0.25)"`.

- [ ] **Step 3: Close button (lines 172-181)**

Change:
```tsx
            background: "rgba(255,255,255,0.10)",
            border: "1px solid rgba(255,255,255,0.15)",
```
to:
```tsx
            background: "rgba(43,27,18,0.06)",
            border: "1px solid rgba(43,27,18,0.16)",
```
Change `color: "rgba(255,255,255,0.6)"` (line 181) to `color: "rgba(43,27,18,0.6)"`.

- [ ] **Step 4: Success state (lines 195, 199, 201)**

Change `color: "#ffffff"` (line 195) → `color: "var(--ink)"`.
Change `color: "rgba(255,255,255,0.70)"` (line 199) → `color: "rgba(43,27,18,0.7)"`.
Change `color: "#ff1f71"` (line 201) → `color: "var(--terracotta)"`.

- [ ] **Step 5: Form headers + signup count (lines 216, 220, 227-229)**

Change `color: "#ffffff"` (line 216) → `color: "var(--ink)"`.
Change `color: "#ff1f71"` (line 220) → `color: "var(--terracotta)"`.
Change `color: "rgba(255,255,255,0.7)"` (line 227) → `color: "rgba(43,27,18,0.7)"`.
Change (lines 228-229) `color: "#ff1f71"`, `textShadow: "0 0 12px rgba(255,31,113,0.5)"` → `color: "var(--terracotta)"`, `textShadow: "none"` (remove the glow — no neon glow on a light card; simplest is to just delete the `textShadow` line).

- [ ] **Step 6: Gender select dropdown (lines 258-274)**

Change:
```tsx
                  colorScheme: "dark",
                  appearance: "none",
                  cursor: "pointer",
                  color: gender ? "white" : "rgba(255,255,255,0.45)",
                  borderColor: genderError ? "rgba(255,31,113,0.7)" : "rgba(255,255,255,0.18)",
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23ffffff' fill-opacity='0.5' d='M6 8L0 0h12z'/%3E%3C/svg%3E\")",
```
to:
```tsx
                  colorScheme: "light",
                  appearance: "none",
                  cursor: "pointer",
                  color: gender ? "var(--ink)" : "rgba(43,27,18,0.45)",
                  borderColor: genderError ? "rgba(193,81,47,0.7)" : "rgba(43,27,18,0.22)",
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%232B1B12' fill-opacity='0.5' d='M6 8L0 0h12z'/%3E%3C/svg%3E\")",
```
Change the `<option>` elements (lines 269-273) — replace every `style={{ color: "white", background: "#0f2044" }}` with `style={{ color: "var(--ink)", background: "var(--parchment)" }}`, and the disabled placeholder's `style={{ color: "rgba(255,255,255,0.45)", background: "#0f2044" }}` with `style={{ color: "rgba(43,27,18,0.45)", background: "var(--parchment)" }}`.

- [ ] **Step 7: Error messages (lines 276, 294, 298, 337)**

Change every `color: "#ff1f71"` in error-message spots to `color: "var(--terracotta)"`, and the email input's `borderColor: emailError ? "rgba(255,31,113,0.7)" : "rgba(255,255,255,0.18)"` (line 294) to `borderColor: emailError ? "rgba(193,81,47,0.7)" : "rgba(43,27,18,0.22)"`.

- [ ] **Step 8: Overlay backdrop (line 134)**

Change `background: "rgba(0,0,0,0.55)"` to `background: "rgba(43,27,18,0.35)"` (keep the blur — this is the page-dimming overlay behind the modal, not a glass card).

- [ ] **Step 9: Visual check**

Run: `npm run dev`, visit `/`, click "Join Waitlist" in the nav. Confirm the modal renders as a parchment-deep card with ink text, terracotta accents, and that the form still validates/submits correctly (test with a non-`@student.unimelb.edu.au` email to confirm the error state still shows in terracotta, not invisible).

- [ ] **Step 10: Commit**

```bash
git add components/WaitlistModal.tsx
git commit -m "style: re-theme WaitlistModal to parchment/terracotta"
```

---

### Task 11: MarkdownContent.tsx

**Files:**
- Modify: `components/MarkdownContent.tsx:33`, `:43`, `:77`, `:96`, `:110`

- [ ] **Step 1: Link colours (lines 33, 43)**

Change both instances of `style={{ color: "#fff", textDecoration: "underline" }}` to `style={{ color: "var(--ink)", textDecoration: "underline" }}`.

- [ ] **Step 2: Heading, list, paragraph colours (lines 77, 96, 110)**

Change `color: "#fff"` (line 77, `<h2>`) → `color: "var(--ink)"`.
Change `color: "rgba(255,255,255,0.75)"` (line 96, `<ul>`) → `color: "rgba(43,27,18,0.75)"`.
Change `color: "rgba(255,255,255,0.75)"` (line 110, `<p>`) → `color: "rgba(43,27,18,0.75)"`.

- [ ] **Step 3: Visual check**

Run: `npm run dev`, visit any `/blog/[slug]` post. Confirm headings/body/links render in ink on the (now-parchment, via Task 12) page background.

- [ ] **Step 4: Commit**

```bash
git add components/MarkdownContent.tsx
git commit -m "style: re-theme MarkdownContent to ink text"
```

---

### Task 12: Static pages — privacy, contact, blog index, blog post

**Files:**
- Modify: `app/privacy/page.tsx:124-153`, `app/contact/page.tsx:17-30`, `app/blog/page.tsx:18-43`, `app/blog/[slug]/page.tsx:68-71`

All four files repeat the same handful of literal colours. Apply this exact mapping to each file:

| Old | New |
|---|---|
| `background: "var(--navy-dark)"` (the `<main>` wrapper) | `background: "var(--parchment)"` |
| `color: "#fff"` (page `<h1>`) | `color: "var(--ink)"` |
| `color: "rgba(255,255,255,0.55)"` (date/effective-date byline) | `color: "rgba(43,27,18,0.55)"` |
| `color: "rgba(255,255,255,0.75)"` (body paragraphs) | `color: "rgba(43,27,18,0.75)"` |
| `color: "rgba(255,255,255,0.7)"` (blog index excerpt, `app/blog/page.tsx:43`) | `color: "rgba(43,27,18,0.7)"` |
| `border: "1px solid rgba(255,255,255,0.1)"` / `background: "rgba(255,255,255,0.03)"` (blog index post-link card, `app/blog/page.tsx:34-35`) | `border: "1px solid rgba(43,27,18,0.14)"` / `background: "var(--parchment-deep)"` |

- [ ] **Step 1: `app/privacy/page.tsx`**

Apply the table above at lines 124, 130, 143, 145, 146, 149, 150, 152 (the `<h2>`/`<p>` colours inside `PrivacyBody`, the `<main>` background, and the page `<h1>`/byline/intro paragraphs).

- [ ] **Step 2: `app/contact/page.tsx`**

Apply the table above at lines 17, 24, 25, 30 (`<main>` background, `<h1>`, body paragraph, and the `mailto:` link — change its `color: "#fff"` to `color: "var(--ink)"` too).

- [ ] **Step 3: `app/blog/page.tsx`**

Apply the table above at lines 18, 20, 21, 34-35, 39, 42, 43 (`<main>` background, `<h1>`, intro paragraph, post-card border/background, post date, post title, post excerpt).

- [ ] **Step 4: `app/blog/[slug]/page.tsx`**

Apply the table above at lines 68, 70, 71 (`<main>` background, post `<h1>`, post date byline). `MarkdownContent` (rendering `post.content`) was already handled in Task 11.

- [ ] **Step 5: Visual check**

Run: `npm run dev`, visit `/privacy`, `/contact`, `/blog`, and any `/blog/[slug]`. Confirm all four render on a parchment background with ink text, matching the home page's new palette.

- [ ] **Step 6: Commit**

```bash
git add app/privacy/page.tsx app/contact/page.tsx app/blog/page.tsx "app/blog/[slug]/page.tsx"
git commit -m "style: re-theme static pages (privacy, contact, blog) to parchment/terracotta"
```

---

### Task 13: Texture polish — torn section edge + terracotta star accent (optional, do last)

This is the one task drawing on spec §5/§6 motifs rather than a mechanical colour swap. Keep it small and CSS-only (no new image assets) since it's the most speculative part of the spec — if short on time, this is the task to defer or drop without blocking the rest of the reskin.

**Files:**
- Modify: `app/globals.css` (new `.torn-edge` utility class), `components/Hero.tsx` (apply it to the fold-1/fold-2 boundary)

**Interfaces:**
- Consumes: `var(--parchment)`, `var(--terracotta)` from Task 1.

- [ ] **Step 1: Add a CSS-only torn-edge divider class**

In `app/globals.css`, after the `.grain-heavy` block, add:
```css
/* Torn-paper section divider (spec §5) — a jagged clip-path, no image asset. */
.torn-edge {
  position: relative;
}
.torn-edge::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 14px;
  background: var(--parchment);
  clip-path: polygon(
    0% 0%, 4% 100%, 8% 20%, 12% 100%, 16% 10%, 20% 100%, 24% 30%, 28% 100%,
    32% 0%, 36% 100%, 40% 15%, 44% 100%, 48% 25%, 52% 100%, 56% 5%, 60% 100%,
    64% 20%, 68% 100%, 72% 10%, 76% 100%, 80% 30%, 84% 100%, 88% 15%, 92% 100%,
    96% 5%, 100% 100%, 100% 100%, 0% 100%
  );
}
```

- [ ] **Step 2: Apply it to the Hero fold boundary**

In `components/Hero.tsx`, on the Fold 2 `<section>` (the one at line ~204-211 with `className="grain"`), add `torn-edge` to the class list:
```tsx
        className="grain torn-edge"
```

- [ ] **Step 3: Add a small terracotta star accent near the primary CTA**

In `components/Hero.tsx`, the "Join the Waitlist" button sits inside a plain wrapper `<div>` at lines 153-160:
```tsx
          <div>
            <button
              className="neon-btn"
              onClick={openWaitlist}
              aria-label="Join the Campus Crush waitlist"
            >
              Join the Waitlist →
            </button>
```
Change it to give the wrapper a relative positioning context and add a small decorative star clipped to its own bounds (aria-hidden, purely visual, matches the star motif in `specs/social-media-inspo.png`; `pointer-events: "none"` keeps it from intercepting clicks; anchoring inside the relatively-positioned wrapper — rather than with large negative margins — keeps it from ever extending past the button's own footprint, so it can't cause a `bento-audit.spec.ts` viewport overflow):
```tsx
          <div style={{ position: "relative", display: "inline-block" }}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="var(--terracotta)"
              aria-hidden="true"
              style={{ position: "absolute", top: "-8px", right: "-8px", pointerEvents: "none" }}
            >
              <path d="M12 0l2.5 8.5L23 11l-8.5 2.5L12 22l-2.5-8.5L1 11l8.5-2.5z" />
            </svg>
            <button
              className="neon-btn"
              onClick={openWaitlist}
              aria-label="Join the Campus Crush waitlist"
            >
              Join the Waitlist →
            </button>
```

- [ ] **Step 4: Visual check**

Run: `npm run dev`, visit `/`. Confirm a jagged torn-paper edge appears at the bottom of the Hero's second fold, and a small terracotta star sits near the primary CTA without overlapping the button text or breaking the `bento-audit.spec.ts` in-viewport assertions (re-run Task 14 to confirm).

- [ ] **Step 5: Commit**

```bash
git add app/globals.css components/Hero.tsx
git commit -m "style: add torn-paper section divider and star CTA accent"
```

---

### Task 14: Full regression pass

**Files:** none modified — verification only.

- [ ] **Step 1: Run the full Playwright suite**

Run: `npx playwright test`
Expected: all tests in `tests/hero.spec.ts` and `tests/bento-audit.spec.ts` PASS. These assert structure/behaviour (element counts, visibility, in-viewport rects, nav background presence on scroll) — none assert specific colour values, so a correct reskin should not break them. If `bento-audit.spec.ts` fails on any viewport, it means a text/element grew or shifted (e.g. from Task 13's star accent) enough to overflow — shrink or reposition the offending element, don't skip the assertion.

- [ ] **Step 2: Full manual visual sweep**

Run: `npm run dev`. Visit `/`, `/blog`, `/blog/[any-slug]`, `/privacy`, `/contact`. Confirm:
- No navy, no neon pink, no gradient-clip text, no `backdrop-filter` glass anywhere.
- Every section reads on a parchment or parchment-deep surface, except the Footer (deep burgundy, by design).
- Photos read faded/warm, not dark/desaturated.
- All site copy is unchanged from before this plan (spot-check a few headlines/FAQ answers against `git show main:components/Hero.tsx` etc. if in doubt).

- [ ] **Step 3: Grep for any missed old-brand literals**

Run:
```bash
grep -rn "#ff1f71\|rgba(255,31,113\|var(--navy-dark)\|backdropFilter" app components --include="*.tsx" | grep -v "components/Matchmaker.tsx\|components/AntiApp.tsx\|components/SocialProof.tsx\|components/Testimonials.tsx\|components/AppMockup.tsx\|Navbar.tsx\|WaitlistModal.tsx"
```
Expected: no output (the two remaining `backdropFilter` usages, in `Navbar.tsx`'s scrolled state and `WaitlistModal.tsx`'s page-dimming overlay, are intentional legibility scrims per Task 2/10 notes, not glass-card surfaces, so they're excluded from this check). Any other match is a spot this plan missed — fix it before considering the reskin done.

- [ ] **Step 4: Final commit (if step 3 required fixes)**

```bash
git add -A
git commit -m "style: fix remaining old-brand colour literals found in regression sweep"
```
