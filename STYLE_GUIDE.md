# Campus Crush — Style Guide

A portable description of the website's look, theme, and colours. Hand this to any frontend agent to reproduce a very similar result. Values are taken from the live `app/globals.css`, `app/layout.tsx`, and the components.

---

## 1. The vibe (read this first)

Campus Crush is a **Gen‑Z college dating brand** with a **dark, moody, film‑photo aesthetic**. The feeling is playful but premium, scrappy but intentional — like a disposable‑camera scrapbook rendered in a neon‑lit nightclub.

Three pillars define every screen:

1. **Deep navy canvas** — almost-black blue, never pure black, never light.
2. **One loud accent: neon pink** — used sparingly for energy (CTAs, numbers, glows, gradient text).
3. **Grainy, desaturated photography** — real candid date photos, darkened, black‑speckled, sharp‑cornered.

A **retro pixel display font** (Jersey 25) carries all the personality; body text is plain Helvetica so the font and photos do the talking.

> ⚠️ **Important for reproduction:** `globals.css` contains a second, *legacy* colour system inherited from the original ditto.ai template — warm cream/olive/yellow tokens (`--Color-Nu-*`, `--Color-Yellow #ffcd2a`, `--bg #f7f7f2`). **These are NOT used in the live design.** The shipping site is **navy + neon pink**. Ignore the cream/yellow tokens unless explicitly asked.

---

## 2. Colour palette

### Core (this is the real theme)
| Role | Hex | Notes |
|------|-----|-------|
| Page background | `#081721` | Deep near‑black navy (set on `body`). The base canvas. |
| Navy dark | `#0a1628` | `--navy-dark` — solid section backgrounds (e.g. "how it works", behind cards). |
| Navy mid | `#0f2044` | `--navy-mid` |
| Navy light | `#1a3060` | `--navy-light` |
| **Neon pink (brand accent)** | `#ff1f71` | The signature colour. CTAs' text, scarcity numbers, glows, gradient endpoints, pings. Use sparingly. |
| White | `#ffffff` | Headlines, CTA button fills, primary text on dark. |

### Text on the dark canvas (use white at opacities, not grays)
| Use | Value |
|-----|-------|
| Primary heading / body | `#ffffff` or `rgba(255,255,255,0.9)` |
| Secondary body | `rgba(255,255,255,0.72)` – `0.8` |
| Muted / eyebrow | `rgba(255,255,255,0.45)` – `0.6` |

### Accent glows / tints (recurring literals)
- Pink glow (text-shadow): `0 0 12px rgba(255,31,113,0.5)` (numbers), `0 0 18px rgba(255,31,113,0.45)` (headings).
- Pink pill tint: bg `rgba(255,31,113,0.10)`, border `rgba(255,31,113,0.35)`.
- Photo dark overlay: `rgba(6,12,22,0.3)`.
- Section scrim over photos: `linear-gradient(180deg, rgba(6,12,22,0.55) 0%, rgba(6,12,22,0.72) 100%)`.
- Glass (frosted) surfaces: `rgba(255,255,255,0.07)`–`0.12` fill, `rgba(255,255,255,0.12)`–`0.2` border, `backdrop-filter: blur(16–24px)`.

### Utility brights (rarely, for stickers/badges — from legacy tokens)
`--Color-Red #ef4146`, `--Color-Green #2faf51`, `--Color-Blue #4285f4`, `--Color-Orange #f5a735`, `--Color-Error #ee4697`.

---

## 3. Typography

Two typefaces, strict roles.

### Display / headings — **Jersey 25** (a chunky retro **pixel/arcade** font)
- Loaded via `next/font/google` (`Jersey_25`, weight 400) as CSS var `--font-jersey`; applied with the `.font-jersey` class.
- Stack: `var(--font-jersey), 'Jersey 25', 'Courier New', monospace`.
- Always `font-weight: 400`. Personality comes from size + tracking, not weight.
- Default `letter-spacing: 0.06em`; eyebrows/labels go wider (`0.2em`–`0.3em`, uppercase).
- Used for: hero headline, section H2s, step numbers, button labels, stat numbers, FAQ questions.

### Body / UI — **Helvetica**
- Stack: `Helvetica, Arial, sans-serif`; `line-height: 1.5`.
- Normal weight, deliberately neutral. Paragraphs, FAQ answers, descriptions.

### Recurring type patterns
- **Hero headline:** Jersey, `font-size: clamp(3rem, 7vw, 4.5rem)`, white/90, tight `line-height: 0.88`.
- **Eyebrow above headline:** Jersey, `clamp(1rem,3vw,1.5rem)`, `letter-spacing: 0.3em`, uppercase, white/60.
- **Section H2 with gradient fill (signature):**
  ```css
  font-family: var(--font-jersey);
  font-size: clamp(2.2rem, 5vw, 3.75rem);
  letter-spacing: 0.02em; line-height: 1.05;
  background: linear-gradient(135deg, #ffffff 55%, #ff1f71 100%);
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent;
  ```
- **Section label pill (`.section-label`):** uppercase Jersey, `0.8rem`, `letter-spacing: 0.2em`, in a translucent pill. Pink variant: text `#ff1f71`, bg `rgba(255,31,113,0.10)`, border `rgba(255,31,113,0.35)`.

---

## 4. Buttons

Everything is a **fully rounded pill** (`border-radius: 9999px`, `min-height: 44px`, `inline-flex`, `gap: 0.5rem`). Hover lifts `translateY(-1px)`.

| Class | Look | Use |
|-------|------|-----|
| `.neon-btn` | **White fill, neon‑pink text**, Jersey font, pink text‑glow + pink drop shadow (`box-shadow: 0 4px 20px rgba(255,31,113,0.25)`). | Primary CTA everywhere ("Join the Waitlist →"). |
| `.glass-btn` | Frosted translucent‑white gradient, `backdrop-filter: blur(24px) saturate(180%)`, white text, inner highlight. | Secondary actions over photos (e.g. "Instagram"). |

(`.btn-primary` / `.btn-outline` exist but are legacy dark‑pill ditto buttons — not used in the live navy design.)

---

## 5. Photography treatment — the heart of the look

Always real, candid, slightly grainy **couple/date lifestyle photos**, treated to feel like film:

- **Desaturated, darkened:** `filter: saturate(0.82) brightness(0.9)`. **Never blur the foreground photos.**
- **Black‑speckle grain:** apply `.grain-heavy` (an SVG `feTurbulence` + gamma‑crushed black speckle, `opacity: 0.85`, `mix-blend-mode: multiply`). This is the signature texture on the bento photos and section backdrops. `.grain` is a lighter version for subtle cases.
- **Slight dark overlay** over each photo tile: `rgba(6,12,22,0.3)` (sits above image, below grain).
- **Sharp corners** on the gallery photos (`border-radius: 0`).
- **Section backdrops:** a full‑bleed photo with light `filter: blur(3px) scale(1.06)`, then a navy gradient scrim, then `.grain-heavy`, then centered content on top. (Z‑order: image → scrim → grain `::after (z‑index 3)` → content `z‑index 5`.)
- Default `object-position: center 40%` (faces sit slightly high).

---

## 6. Layout & spacing

- **Breakpoints:** mobile‑first; key custom breakpoint at **900px** for the hero split; Tailwind `sm` = 640px for general grids.
- **Section padding (`.section-pad`):** `4rem 1.25rem` mobile → `5rem 3rem` ≥640px. Sections often `min-height: 92vh`, vertically centered.
- **Content width:** centered, `max-width: 52rem`–`56rem`.
- **Grids:** `.cols-3` / `.cols-2` — 1 column on mobile, `repeat(3,1fr)` / `repeat(2,1fr)` at ≥640px, `gap: 2.5rem`.
- **Hero is a bento split:** `.hero-bento` is one column on mobile, `42% 58%` (text panel | photo grid) at ≥900px, capped to `height: 100vh`. The photo grid (`.bento`) is an asymmetric grid (`"A A B B" / "A A C D" / "E F F G"`) and is **hidden on mobile** — mobile shows a full‑screen photo‑background hero panel instead.
- **Navbar:** fixed, transparent at top → navy translucent + blur after 60px scroll. Logo left, two equal pill actions right.

---

## 7. Section anatomy (the repeating pattern)

Most content sections follow this recipe:

```
<section class="grain-heavy" style="position:relative; min-height:92vh; centered">
  <img blurred date-photo backdrop (blur 3px, scale 1.06) />
  <div navy gradient scrim />
  <div content z-index:5, max-width 52rem, centered>
     <p class="section-label">EYEBROW</p>
     <h2 gradient-clip headline>
     <p body copy white/80>
     <grid of glass cards or feature columns>
  </div>
</section>
```

Cards are **dark glass**: `rgba(0,0,0,0.55)` or `rgba(20,30,52,0.92)` fill, `backdrop-filter: blur(16px)`, `border: 1px solid rgba(255,255,255,0.12)`, `border-radius: ~1.25–1.75rem`, soft shadow + optional pink glow.

---

## 8. Motion

Subtle and characterful — never flashy.

- **Headline wobble (`.wiggle-text` + `@keyframes headline-wiggle`):** slow infinite rotate/skew ±1.4°, `2.8s ease-in-out`, `transform-origin: center bottom`. Applied **only to the interchanging word** in a rotating headline, not static text.
- **Rotating phrase:** swaps every ~2s with a 0.32s opacity+translateY cross‑fade.
- **Count‑up + settle:** scarcity number animates from 100 down to real value (easeOutCubic, ~900ms) then one `spotPulse` (scale 1→1.08 + pink glow burst).
- **Hover‑lift:** buttons `translateY(-1px)`; photo tiles `translateY(-2px)` + stronger shadow, gated behind `@media (hover: hover)` (no hover on touch).
- **`fadeIn`** for elements entering.
- **Always** honour `prefers-reduced-motion`: collapse all animation/transition to `0.01ms` and disable smooth scroll.

---

## 9. Voice & tone (copy)

Confident, warm, a little cheeky; short sentences; lowercase playful headlines, ALL‑CAPS eyebrows. Examples in use: "meet your [movie marathon] this winter", "It's a Match!", "No swiping. We do everything for your first date, all you need to do is accept." Avoid corporate/marketing fluff and em‑dashes in UI copy where a period works.

---

## 10. Quick reproduction checklist / drop‑in tokens

```css
/* Theme */
--bg-navy:        #081721;  /* page */
--navy-dark:      #0a1628;  /* solid sections */
--navy-mid:       #0f2044;
--navy-light:     #1a3060;
--pink:           #ff1f71;  /* the only accent */
--text:           #ffffff;
--text-2:         rgba(255,255,255,0.72);
--text-muted:     rgba(255,255,255,0.5);

/* Fonts */
--font-display: 'Jersey 25', monospace;   /* headings, labels, buttons, numbers — weight 400 */
--font-body:    Helvetica, Arial, sans-serif;
```

To recreate the look:
1. Navy (`#081721`) everywhere; white text; **one** accent — neon pink `#ff1f71`, used sparingly.
2. Jersey 25 (pixel font) for all display type; Helvetica for body. Wide uppercase tracking on eyebrows.
3. Gradient‑clip headlines (`white → pink`).
4. Pill buttons; primary = white fill + pink text + pink glow.
5. Candid date photos: desaturated, darkened, **black‑speckle grain**, sharp corners, slight dark overlay, never blurred (except soft section backdrops behind a scrim).
6. Dark glass cards; centered sections with photo‑backdrop + scrim + grain.
7. Subtle motion: word‑level wobble, count‑up + pulse, 1–2px hover lifts; respect reduced‑motion.
8. Tone: playful, concise, lowercase headlines / ALL‑CAPS labels.
