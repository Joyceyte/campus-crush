# Campus Crush — Frontend Spec (pending session)

All changes below are queued for the next frontend implementation session. Do not implement until instructed.

---

## 1. Hero — remove carousel, squiggly-line cutoff

- Remove the fixed background image carousel from the hero fold entirely. Hero background becomes a solid navy (`var(--navy-dark)`) or a very subtle dark gradient.
- Include "University of Melbourne" more prominently in the hero — e.g. add a line below the wiggle headline: small text "Launching at University of Melbourne · Winter 2026"
- At the bottom of the hero fold, render a **wavy/squiggly SVG divider** that creates a clear visual cutoff into the next section. This replaces the abrupt edge. The SVG should have the same fill color as the WhyUs section background below it.

---

## 2. "How It Works" & "BUILT DIFFERENT" — interesting section headers

- Section heading treatment: instead of just a `.section-label` pill + plain `<h2>`, give these headings a more distinctive style. Options:
  - Large display font with a slightly tilted (rotate ~-1.5deg) ink-stamp look
  - A rough underline drawn in neon pink SVG squiggle beneath the heading
  - Background of the heading text uses a gradient clip: `background: linear-gradient(135deg, #fff 60%, #ff1f71); -webkit-background-clip: text; color: transparent`
- Apply this treatment to: "HOW IT WORKS", "BUILT DIFFERENT / Tired of Tinder and Hinge", "YOUR MATCHMAKER", "PRIVATE & SAFE"

---

## 3. Feature icons — replace SVG line icons with cute image assets

Remove all SVG line icons (brain, magnifying glass, sparkle star) from:
- WhyUs matchmaker features (Learns your type / Scans the whole pool / Gets better every date)
- PrivateSafe pillars (Verified students / Only your date sees you / Coffee date)

Replace with small OpenMoji or Twemoji PNG images (hosted via jsDelivr CDN). These are proper illustrated images, not system emoji glyphs.

CDN base: `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/`

Suggested icons (Twemoji PNG, 72x72):
- Learns your type → `1f9e0.png` (brain)
- Scans the whole pool → `1f50d.png` (magnifying glass)
- Gets better every date → `2728.png` (sparkles — multi-star, NOT the basic star)
- Verified students → `1f393.png` (graduation cap)
- Only your date sees you → `1f512.png` (lock)
- Coffee date on campus → `2615.png` (hot beverage)

Usage: `<img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f9e0.png" width="40" height="40" alt="" />`

---

## 4. "Built Different" background — less blurred, grainy black overlay

Current: `bar-date.jpeg` at `blur(40px)`, opacity 0.35, very dark navy overlay.

Change to:
- `blur(6px)` (much less — photo is clearly visible)
- opacity `0.75` (brighter)
- Overlay: `rgba(0,0,0,0.45)` (warm black, not navy)
- Add a CSS film grain texture class on top (`.grain` — already in globals.css)
- Text must remain fully legible — bump heading to pure white, body to `rgba(255,255,255,0.85)`

Same treatment for **PrivateSafe** (park-date.jpeg).

---

## 5. Scrapbook torn-edge dividers — ditto.ai style

The `torn-top` CSS pseudo-element currently in globals.css is not visually prominent enough. Replace with actual inline SVG dividers placed between sections.

At the **bottom** of each dark section (WhyUs, PrivateSafe, FAQ, FinalCTA), render:
```tsx
<div aria-hidden="true" style={{ position: 'relative', height: '48px', marginBottom: '-2px', overflow: 'hidden' }}>
  <svg viewBox="0 0 1440 48" preserveAspectRatio="none" style={{ position: 'absolute', bottom: 0, width: '100%', height: '100%' }}>
    <path d="M0,32 C120,48 240,16 360,32 C480,48 600,8 720,28 C840,48 960,12 1080,32 C1200,48 1320,20 1440,32 L1440,48 L0,48 Z" fill="[next-section-color]" />
  </svg>
</div>
```

Each divider's `fill` matches the background of the section that comes after it, so the wave cuts cleanly from one section into the next.

---

## 6. Navbar — glass blur (not navy) on mobile scroll

Current mobile scroll behavior adds `rgba(8,18,40,0.80)` navy. Change to match `.glass-btn` style:
```js
background: 'rgba(255,255,255,0.08)'
backdropFilter: 'blur(24px) saturate(180%)'
border-bottom: '1px solid rgba(255,255,255,0.12)'
```

Threshold: trigger at `window.scrollY > 60` (not 80vh — 60px is enough to clear the hero text). This prevents text from ever appearing behind the navbar as user scrolls.

---

## 7. FinalCTA — cleanup

- Remove the `THE VIBE` section-label pill entirely
- Update subtext: "Join the waitlist and be the first to know when Campus Crush launches at the **University of Melbourne**."
- Bold/highlight "University of Melbourne" in the subtext (neon pink or white bold)

---

## 8. WhyUs (Built Different) — layout polish

The section currently uses a blurred image + navy. After change #4 above (less blur, grainy black), also:
- Remove the `border` divider between "Tired of Tinder" half and "Matchmaker" half — let them flow naturally
- Reduce padding between the two halves

---

## Notes

- All changes use existing CSS vars and inline styles (no new Tailwind utility classes)
- Countdown target date: `2026-06-29T07:00:00` (1 week from 2026-06-22)
- Film grain overlay (`.grain`) already in globals.css
- `torn-top` class can be removed from globals.css and replaced with inline SVG dividers

---
*Written 2026-06-22. Implement in a dedicated session when instructed.*
