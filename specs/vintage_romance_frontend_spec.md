# Campus Crush — Vintage Romance Frontend Spec

Status: **proposed visual direction, not yet implemented.** This replaces the navy/neon-pink Gen-Z look documented in `STYLE_GUIDE.md` with a new brand direction. Do not implement until instructed — this is a design contract to review first.

Source material: `specs/90s_ui_inspo.png` (uploaded reference) + the brief below.

---

## 1. Visual thesis

Campus Crush should feel like a **love letter that arrived in the mail, not an app that pinged your phone** — a warm, paper-and-ink world sitting between a 70s paperback romance cover, a vintage cinema poster, and a handwritten note, standing deliberately apart from the sterile app-store-blue of Hinge and Bumble.

**Content plan** (same six sections as today, new skin):
- **Hero** — wordmark, the love-letter promise, one CTA, one dominant illustrated visual (envelope/stamp, not a phone mockup).
- **Support (How It Works)** — the mechanism, told as steps in a letter, not app-feature bullets.
- **Detail (Built Different / matchmaker)** — atmosphere and proof: why this isn't swiping.
- **Detail (Private & Safe)** — trust, told warmly, not with lock-icon corporate reassurance.
- **FAQ** — plainspoken, in voice.
- **Final CTA** — "your match arrives Sunday" energy, one action.

**Interaction thesis** (2-3 motion ideas, see §8): a wax-seal press on the primary CTA, a letter/flap unfold on scroll-reveal, a postmark "stamp" that thumps down when a section enters view.

---

## 2. What to carry over vs. discard from the current build

The uploaded inspo image (`90s_ui_inspo.png`) is a 90s/Y2K dating-app UI mockup — pastel pink, pixel heart logo, chunky pixel-style labels, flat app-chrome windows (traffic-light dots, tab bar). That is **not** the target palette or type — it's a structural reference only. Translate its bones, not its skin:

| Keep (structural idea from the image) | Discard (its literal skin) | Replace with |
|---|---|---|
| Top pill-tab nav with one active state | Flat pink pill, pixel font | Terracotta underline or ink-stamp active state, serif labels |
| Traffic-light window dots as a framing device | Cartoon macOS dots | Small wax-seal circles or postmark rings |
| Card-based "match reveal" (photo + bio + two actions) | Flat cream/pink card, sharp app-UI | A "letter" card: deckled/torn paper edge, ink-stamp corner, serif bio copy |
| Like / Dislike as two clear pill buttons | Emoji-style icon buttons | "Write back" / "Return to sender" language, wax-seal and torn-stamp icon treatment |
| Profile page: photo grid + labeled fields (location, profession, interests) | Y2K pastel styling | Same layout, reskinned as a dossier/letter page on parchment |

Also **fully discard** from the live site (`STYLE_GUIDE.md`): deep navy canvas, neon pink `#ff1f71`, Jersey 25 pixel font, black-speckle photo grain, dark glass cards. None of it carries into this direction.

---

## 3. Colour palette

Warm, matte, sun-faded — like a paperback left on a windowsill. No pure white, no pure black, no cool blues or grays anywhere.

| Role | Hex | Notes |
|---|---|---|
| Page background (parchment) | `#F7EFE1` | Warm cream, slightly warmer/darker than paper-white. Base canvas, always. |
| Card / section fill (deeper paper) | `#EFE3CC` | For "letter" cards, panels, alternating section bands. |
| Ink (primary text) | `#2B1B12` | Warm near-black brown — sepia ink, never `#000`. |
| **Terracotta (primary accent)** | `#C1512F` | Primary CTA fill, links, the one "loud" colour. |
| Deep burgundy (secondary accent) | `#6E1F2B` | Headlines-on-photo, hover states, deep depth colour, footer band. |
| Dusty rose (tertiary/soft accent) | `#D48C82` | Tags, soft dividers, secondary button fills, hover tints. |
| Warm amber (detail accent) | `#DE9F4E` | Stamps, underlines, small illustrated details, star-rating-style accents. |
| Muted sage (rare 4th neutral, optional) | `#8A9270` | Only if a cool counter-note is needed (e.g. a "verified" stamp) — use sparingly, never as a base. |

Text-on-parchment opacities (avoid literal grays):
- Primary: `#2B1B12` (ink, full)
- Secondary body: `rgba(43,27,18,0.72)`
- Muted / eyebrow: `rgba(43,27,18,0.5)`

Implementation note: `app/globals.css` already carries a **legacy, currently-unused** cream/olive/yellow token set (`--Color-Nu-*`, `--Color-Yellow #ffcd2a`, `--bg #f7f7f2`) inherited from the original ditto.ai template — left over from before the navy pivot. Don't build a third parallel system: when this spec is implemented, either repoint those tokens to the palette above or remove them and introduce fresh `--parchment-*` / `--terracotta` / `--burgundy` vars. Confirm before assuming the legacy values are close enough — they aren't (`#ffcd2a` is a cold lemon yellow, not warm amber).

---

## 4. Typography

Two typefaces, one sparing third for "handwritten" accents only.

### Display / wordmark & headings — **Fraunces**
- Warm, editorial serif with soft/wonky optical-size variants — reads like a 70s paperback title or cinema-poster credit line, not a rounded sans-serif.
- Load via `next/font/google` (`Fraunces`), use the `soft` optical-size axis where available for headlines; standard axis for the wordmark.
- Weight range 400-600 for headings; 500-600 for the wordmark itself.
- Wordmark: set in Fraunces, not a rounded sans — this is the single most important typographic rule in the brief.

### Body / UI — **Newsreader**
- A serif built for reading — pairs naturally with Fraunces (same editorial lineage), keeps every line of body copy feeling like a printed page rather than an app.
- Normal weight (400-500), `line-height: 1.6`, comfortable measure (`max-width: ~34rem` for paragraphs).

### Ephemera / handwritten accent — **Caveat** (used sparingly, justified 3rd font)
- Reserved for: margin annotations, a "P.S." note, the signature-style flourish under the final CTA, postmark date-stamps. Never for body copy or primary headings — this stays a spice, not a base.

### Recurring type patterns
- **Hero headline:** Fraunces (soft), `clamp(2.6rem, 6vw, 4.25rem)`, ink colour, `line-height: 1.02`, slight optical warmth (avoid tight tracking — this is not a display-pixel font, let it breathe).
- **Eyebrow above headline:** Newsreader italic or Caveat, small, warm-muted ink, e.g. "a love letter, delivered weekly."
- **Section heading:** Fraunces, `clamp(2rem, 4.5vw, 3rem)`, deep burgundy or ink, optionally with a hand-drawn amber underline SVG beneath (not a gradient-clip — that's the old brand's move).
- **Body copy:** Newsreader, `1rem-1.125rem`, ink at 0.85-0.9 opacity.

---

## 5. Texture

Nothing should feel fully digital.

- **Paper grain:** a subtle noise/grain overlay across every section (`feTurbulence` SVG, low opacity ~0.06-0.1, `mix-blend-mode: multiply`) — much lighter than the current `.grain-heavy` black-speckle treatment, meant to read as paper fiber, not film grain.
- **Deckled/torn edges:** section dividers and card edges use a torn-paper edge (irregular, not a clean wave) rather than the current wavy SVG divider. The existing `torn-top` CSS class in `globals.css` is a reasonable starting point structurally but needs a paper-tear silhouette, not a smooth curve.
- **Slight rotation:** cards, stamps, and photo tiles sit at small random rotations (`-2deg` to `2deg`) like items scattered on a desk — never perfectly grid-aligned.
- **Subtle shadow:** soft, warm-toned drop shadows (`rgba(43,27,18,0.15)`), not cool grey shadows — cards should look like paper resting on a surface.

---

## 6. Illustration & motif language

Illustration over photography wherever possible. If photography is used at all, it should read as a keepsake polaroid or vintage snapshot (warm sepia grade, deckled white border) — never a crisp modern lifestyle photo.

Primary illustrated motifs (hand-drawn/ink-line style, single-colour line art in ink or burgundy):
- **Envelopes** — sealed, half-open, mid-flight — as the primary hero visual and section dividers.
- **Postmarks / postage stamps** — circular date-stamp marks used as badges, corner decorations, "verified" markers, section numbering (step 1/2/3 as stamp numerals).
- **Wax seals** — as the primary CTA button treatment (a rounded seal shape, pressed-in look on click) and as "like" affordance.
- **Handwritten marginalia** — small ink annotations, arrows, underlines (Caveat font) pointing at key phrases.
- **A little heart line-icon** in the vein of the inspo image's pixel heart — but redrawn as a single-stroke ink line drawing, not pixel art.

Avoid: pixel art, emoji, flat vector "SaaS illustration" people, gradients, drop-shadowed 3D icons, anything glassy/neon.

---

## 7. Components

### Buttons
- **Primary CTA:** wax-seal pill — terracotta fill, cream text, Fraunces label, subtle pressed/embossed inner shadow; on click, a brief "stamp down" scale (0.96) + settle, echoing a wax seal press.
- **Secondary:** outline button, ink or burgundy 1.5px border on parchment, no fill.
- Both remain pill or rounded-rect (soft corners, not the sharp corners of the old design) — but softer radius (`0.5-0.75rem`), not the fully-pill `9999px` of the current brand.

### Nav
- Fixed top bar, parchment background (not glass-blur navy) with a thin ink or burgundy hairline border-bottom on scroll.
- Wordmark left (Fraunces), 2-3 nav links right in Newsreader, current section indicated by a short hand-drawn underline rather than a filled pill.

### Cards ("letters," not glass panels)
- Parchment-on-parchment (deeper paper fill `#EFE3CC` on `#F7EFE1` base), deckled/torn edge, slight rotation, soft warm shadow.
- No `backdrop-filter` glass — that effect belongs to the old neon-navy brand and reads cold/digital, the opposite of this brief.

### Dividers
- Torn-paper edge between sections (see §5), or a simple dashed "tear here" line with small scissor-icon accent for a knowing wink at the metaphor — use once, not on every divider, or it becomes a gimmick.

---

## 8. Motion

Restrained, tactile, physical — motion should feel like handling paper, not swiping a screen.

1. **Hero entrance:** an envelope illustration "opens" (flap rotates down/back) as the headline fades/slides up from behind it — one clear entrance sequence, once, on load.
2. **CTA press:** wax-seal scale-down + settle on click (see §7).
3. **Scroll reveal:** section content rises slightly with a soft paper-shadow deepening as it settles into place (`translateY(12px) → 0`, shadow `0 → soft`), rather than a simple opacity fade.
4. Always honour `prefers-reduced-motion` — collapse to instant/no motion.

---

## 9. Copy voice

Warm, unhurried, a little literary — leans into the love-letter metaphor structurally, not just decoratively.

- "Your match arrives Sunday." (cadence over a countdown timer, not "3 DAYS 14 HRS" digital styling)
- Section labels read like envelope markings: "FIRST CLASS" instead of "HOW IT WORKS," "RETURN ADDRESS" instead of "PRIVATE & SAFE" — evaluate case by case; don't force every label into the metaphor if it hurts clarity.
- Avoid ALL-CAPS pixel-eyebrow styling from the old brand; italics or letter-spaced small caps in Newsreader read the part instead.
- Keep sentences short despite the literary tone — this is still a landing page, not a short story.

---

## 10. Hard rules

- No navy, no neon pink, no pixel font, no glass/blur surfaces, no black-speckle photo grain — those all belong to the old brand and actively fight this one.
- No pure white or pure black anywhere.
- No more than two working typefaces (Fraunces + Newsreader); Caveat is a micro-accent only, never body or a full heading.
- No flat SaaS card grids — every card is a "letter" with a torn edge, rotation, and warm shadow.
- No cool-toned shadows or gradients.
- Illustration over photography by default.

## Litmus checks

- Would this still feel right printed in sepia ink on cream paper?
- Does the hero read as a keepsake, not a dashboard?
- Is terracotta the only "loud" colour, with burgundy/rose/amber doing quieter supporting work?
- If every wax-seal/postmark motif were removed, would the page still feel warm and literary from type and colour alone? (It should — motifs support the direction, they aren't the whole direction.)

---
*Written 2026-07-07. Proposed direction — review before implementation.*
