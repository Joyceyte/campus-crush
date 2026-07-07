# Plan — Restructure Hero into a Bento Grid (split layout)

Status: queued for frontend implementation. Inspiration: `public/bento-box-idea.webp` ("The Villa List" split layout) + `public/heading-page-inspo.jpg` (bento concept).

## Goal

Replace the current full-screen fixed photo carousel in `components/Hero.tsx` with a **split bento layout**:
- **Left panel** — brand text column (headline + CTA + scarcity counter).
- **Right side** — bento grid of the 7 date photos as rounded image cards. **No captions / no text overlays on photos.**

Keep all existing branding and behavior. This is a structural restyle of the header only.

## Brand constraints (do not change)

- Navy canvas (`--navy-dark #0a1628` / body `#081721`), neon-pink accent `#ff1f71`.
- Jersey 25 pixel display font (`.font-jersey`) for headline + CTA.
- Grain texture on photo tiles (reuse `.grain`).
- Existing buttons: `.neon-btn` for the CTA.
- Pill radius language; tiles use a larger radius (`~1.25rem` / rounded-2xl).

## Layout spec

### Desktop (≥ 900px)
- Outer hero = CSS grid, two columns: left `~42%`, right `~58%`. `min-height: 100vh`. Gap `~1.5rem`, page padding consistent with `.section-pad`.
- **Left panel** (navy, vertically centered, left-aligned like the inspo):
  - Small eyebrow: `meet your` (pixel font, uppercase, `text-white/60`).
  - Rotating phrase headline (large pixel font, `#ff1f71` or white/90) — **keep the existing rotating-phrase animation and `aria-live` region**.
  - `this winter` sub-line (pixel font, `text-white/45`).
  - `Launching at University of Melbourne · Winter 2026` line (keep current styling).
  - `.neon-btn` "Join the Waitlist →" → `openWaitlist()` (unchanged).
  - Live `X spots left` counter — **keep the existing count-up + `spotPulse` logic** from `useSignupCount`.
- **Right bento grid** — 7 photos, asymmetric, no captions. Recommended `grid-template-areas` (adjustable by the implementer, but keep one dominant tile):
  ```
  "A A B B"
  "A A C D"
  "E F F G"
  ```
  (4 columns × 3 rows; A = dominant hero tile; all 7 of `carouselImages` used once.)
  - **Photo distribution (required):** spread `gay-date.jpg` and `lesbian-date.jpeg` through the grid — do NOT cluster them in the bottom row. Mapping: A=`blurry-iceskating`, B=`gay-date` (top-right), C=`park-date`, D=`beachdate`, E=`lesbian-date` (bottom-left), F=`noodle-date`, G=`bar-date`.
  - **Mobile mapping:** keep the same A–G image assignment with mobile areas `A / B C / D E / F G`, so `gay-date` lands in the first photo pair and `lesbian-date` in the second — neither at the bottom.
  - Each tile: `<img>` `object-fit: cover`, `object-position: center 40%`, filter `saturate(0.9) brightness(0.92)`, `border-radius: 1.25rem`, `.grain`, `overflow: hidden`.
  - Hover: `transform: translateY(-2px)` + slightly stronger shadow (match existing hover-lift idiom). No hover on touch.
  - `alt=""` (decorative) on every photo.

### Mobile (< 900px)
- Single column: left panel content full-width on top (centered text is fine, matching current hero), then the photo grid below as a **2-column** bento (one wide tile on top, then 1×1 tiles). No fixed background.
- Tighten padding to mobile `.section-pad` values.

## Required side-effect: Fold 2 ("how it works")

The current "how it works" section (Fold 2 in `Hero.tsx`) relies on the fixed carousel showing through. After removing the fixed carousel:
- Give Fold 2 a **solid navy background** (`var(--navy-dark)` or body navy) so the glass step cards stay legible.
- Keep `.grain` on it. No other changes to Fold 2 content.

## Motion

- Keep: rotating-phrase fade/translate, spots-left count-up + `spotPulse`.
- Add: subtle tile hover-lift only.
- Honor `prefers-reduced-motion` (already globally handled; ensure no new always-on animation on tiles).

## Out of scope

- No changes to `Navbar`, `WhyUs`, `PrivateSafe`, `FAQ`, `FinalCTA`, `Footer`, `WaitlistModal`.
- No new dependencies. No new image assets (reuse the 7 in `Hero.tsx`).
- No copy rewrites beyond relocation.

## Files

- `components/Hero.tsx` — main rewrite (split layout + bento grid; remove fixed carousel `<div>`; relocate left-panel content; restyle Fold 2 bg). Preserve all hooks/state.
- `app/globals.css` — only if shared helpers are cleaner than inline styles (e.g. a `.bento-tile` class). Reuse existing vars; add nothing brand-new.

## Verification

- `npm run build` passes, no TS/lint errors.
- Desktop: left panel + 7-tile bento, no captions, headline still rotates, spots-left still counts.
- Mobile: stacks to panel + 2-col grid, no horizontal scroll (`overflow-x` already hidden).
- Fold 2 readable on solid navy.
- Reduced-motion: tiles static, no layout shift.
