# Campus Crush — Vintage Romance Frontend Spec

Status: **proposed visual direction, not yet implemented.** This replaces the navy/neon-pink Gen-Z look documented in `STYLE_GUIDE.md` with a new brand direction. Do not implement until instructed — this is a design contract to review first.

Source material: `specs/90s_ui_inspo.png` (structural + photo-treatment reference) + `specs/social-media-inspo.png` (palette + pixel-font-on-light reference) + the brief below.

Revision note (2026-07-07, rev. 2): the original version of this spec dropped Jersey 25 and photography entirely in favour of an all-serif, all-illustration direction. This revision reintroduces the **pixel display font** and **real photography**, run on the same light/parchment canvas — see §3, §4, §6 for what changed and why. Site copy is unchanged by this revision.

---

## 1. Visual thesis

Campus Crush should feel like a **love letter that arrived in the mail, not an app that pinged your phone** — a warm, paper-and-ink world sitting between a 70s paperback romance cover, a vintage cinema poster, and a handwritten note, standing deliberately apart from the sterile app-store-blue of Hinge and Bumble. The chunky pixel font and real candid photography carry over from the current brand — it's the *palette and surface* that shifts from dark/neon to warm/parchment, not the whole identity.

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

`social-media-inspo.png` (a "campus crush"-branded story card) is the second reference — it shows this pivot already half-drawn: cream lined-notebook background with a torn paper edge, a chunky pixel/outline font on the "NEXT" button and taglines, a gold wax-seal circle, terracotta stars, and real (not illustrated) date photos in a faded, sun-bleached grade sitting in a black film-strip band.

| Keep (from `social-media-inspo.png`) | Discard | Replace with |
|---|---|---|
| Chunky pixel/outline type on buttons and taglines | Any residual neon brightness in the font colour | Jersey 25, set in ink or terracotta, never neon pink |
| Torn notebook-paper edge + faint ruled lines | — | Same, as the section-divider / card-edge texture (§5) |
| Gold wax-seal circle, terracotta star motifs | — | Carry into §6 as recurring motifs alongside envelopes/postmarks |
| Real candid photos in a faded film-strip band | Crisp, saturated modern photo grade | 90s-inspo-style fade — see §6 |

**From the live site (`STYLE_GUIDE.md`), keep:** Jersey 25 as the display font, and real candid date photography as the primary visual (not illustration-first). **Discard:** deep navy canvas, neon pink `#ff1f71`, black-speckle photo grain, dark glass cards, gradient-clip headline text. The pixel font and the photos survive this pivot — the dark/neon surface they sat on does not.

---

## 3. Colour palette

Warm, matte, sun-faded — like a paperback left on a windowsill. No pure white, no pure black, no cool blues or grays anywhere. **Rev. 2:** the working accent duo is now **terracotta + yellow**, per the social-media inspo — burgundy/rose drop from named roles to occasional, minor support. Nothing here is neon or fluorescent; every accent is matte and slightly muted, never the saturated `#ff1f71` brightness of the old brand.

| Role | Hex | Notes |
|---|---|---|
| Page background (parchment) | `#F7EFE1` | Warm cream, slightly warmer/darker than paper-white. Base canvas, always — **light, not dark**, replacing the old navy canvas outright. |
| Card / section fill (deeper paper) | `#EFE3CC` | For "letter" cards, panels, alternating section bands. |
| Ink (primary text) | `#2B1B12` | Warm near-black brown — sepia ink, never `#000`. |
| **Terracotta (primary accent)** | `#C1512F` | Primary CTA fill, Jersey headline colour, star/stamp motifs, the "reddish" colour from the brief. |
| **Warm yellow (co-primary accent)** | `#E8B23D` | Second working colour per the brief — muted mustard-yellow, not lemon or neon. Tag/pill fills, secondary buttons, small accents. Brightened slightly from the old `#DE9F4E` amber so it reads as yellow, not just amber-brown. |
| Deep burgundy (minor accent, use sparingly) | `#6E1F2B` | Occasional hover state or footer band only — no longer a named "secondary" colour. |
| Dusty rose (minor accent, use sparingly) | `#D48C82` | Occasional soft divider or tag tint only — not a default. |
| Muted sage (rare 4th neutral, optional) | `#8A9270` | Only if a cool counter-note is needed (e.g. a "verified" stamp) — use sparingly, never as a base. |

Text-on-parchment opacities (avoid literal grays):
- Primary: `#2B1B12` (ink, full)
- Secondary body: `rgba(43,27,18,0.72)`
- Muted / eyebrow: `rgba(43,27,18,0.5)`

Implementation note: `app/globals.css` already carries a **legacy, currently-unused** cream/olive/yellow token set (`--Color-Nu-*`, `--Color-Yellow #ffcd2a`, `--bg #f7f7f2`) inherited from the original ditto.ai template — left over from before the navy pivot. Don't build a third parallel system: when this spec is implemented, either repoint those tokens to the palette above or remove them and introduce fresh `--parchment-*` / `--terracotta` / `--burgundy` vars. Confirm before assuming the legacy values are close enough — they aren't (`#ffcd2a` is a cold lemon yellow, not warm amber).

---

## 4. Typography

**Rev. 2:** the pixel font stays. Two typefaces, one sparing third for "handwritten" accents only.

### Display / headings, labels & buttons — **Jersey 25**
- The same chunky retro pixel/arcade font as the live site (`next/font/google`, `Jersey_25`, weight 400, CSS var `--font-jersey`) — this does **not** get replaced by a serif. What changes is colour and surface: set it in ink (`#2B1B12`) or terracotta (`#C1512F`), never white-on-navy or neon pink, and never gradient-clipped (that effect stays with the old brand).
- Wordmark: the live site already renders the wordmark as a brand image/logo (not text-set), so this rule doesn't apply to it — Jersey governs everything else: hero headline, section H2s, step numbers, button labels, stat numbers, FAQ questions, same roles as today.
- Still always `font-weight: 400`; personality from size + tracking, not weight. Default `letter-spacing: 0.06em`; eyebrows/labels wider (`0.2em`-`0.3em`, uppercase) — same as the live style guide.

### Body / UI — **Helvetica**
- Kept from the live site, unchanged: `Helvetica, Arial, sans-serif`, `line-height: 1.5`, normal weight, deliberately neutral — the pixel font and the photos do the talking, body copy stays plain.

### Ephemera / handwritten accent — **Caveat** (used sparingly, optional 3rd font)
- Reserved for: margin annotations, a "P.S." note, the signature-style flourish under the final CTA, postmark date-stamps. Never for body copy or headings — this stays a spice, not a base, and never competes with Jersey for the same role.

### Recurring type patterns
- **Hero headline:** Jersey, `clamp(3rem, 7vw, 4.5rem)`, ink or terracotta, tight `line-height: 0.88` (same proportions as the live site, new colour).
- **Eyebrow above headline:** Jersey, `clamp(1rem,3vw,1.5rem)`, `letter-spacing: 0.3em`, uppercase, warm-muted ink (`rgba(43,27,18,0.6)`) — same treatment as today, just off navy.
- **Section heading:** Jersey, `clamp(2.2rem, 5vw, 3.75rem)`, ink or terracotta solid fill — **no gradient-clip text**, that's the old brand's signature move and doesn't carry over. A hand-drawn amber/yellow underline SVG beneath is the new equivalent flourish.
- **Body copy:** Helvetica, `1rem-1.125rem`, ink at 0.85-0.9 opacity.

---

## 5. Texture

Nothing should feel fully digital.

- **Paper grain:** a subtle noise/grain overlay across every section (`feTurbulence` SVG, low opacity ~0.06-0.1, `mix-blend-mode: multiply`) — much lighter than the current `.grain-heavy` black-speckle treatment, meant to read as paper fiber, not film grain.
- **Deckled/torn edges:** section dividers and card edges use a torn-paper edge (irregular, not a clean wave) rather than the current wavy SVG divider. The existing `torn-top` CSS class in `globals.css` is a reasonable starting point structurally but needs a paper-tear silhouette, not a smooth curve. `social-media-inspo.png` shows this exact motif — a torn edge down the left side of a lined notebook page — use it as the reference silhouette.
- **Faint ruled lines (new, from `social-media-inspo.png`):** a very subtle horizontal rule pattern (like notebook paper), low-opacity ink lines, behind hero/section copy — optional, use where it reinforces the "letter/journal page" feel without competing with body text.
- **Slight rotation:** cards, stamps, and photo tiles sit at small random rotations (`-2deg` to `2deg`) like items scattered on a desk — never perfectly grid-aligned.
- **Subtle shadow:** soft, warm-toned drop shadows (`rgba(43,27,18,0.15)`), not cool grey shadows — cards should look like paper resting on a surface.

---

## 6. Photography & motif language

**Rev. 2 — this section's thesis flips.** The original version of this spec called for illustration over photography by default. Per the brief, **real candid photography stays the primary visual**, same as the live site — what changes is the colour grade, not the medium.

### Photo treatment (replaces the old grain-heavy navy treatment)
- **Faded, sun-bleached grade** — the reference is the phone-mockup photos in `90s_ui_inspo.png` and the film-strip band in `social-media-inspo.png`: warm, slightly washed-out, lower contrast, like a print left in the sun — not the live site's `saturate(0.82) brightness(0.9)` + black-speckle grain treatment, which reads dark and moody rather than faded and warm.
- Approx. direction: raise brightness slightly, pull contrast down, warm the white balance (push toward amber/cream in the highlights), keep a light grain (paper-fiber level from §5, not `.grain-heavy`'s black speckle).
- Deckled/white polaroid-style border optional per placement — the film-strip band in `social-media-inspo.png` (photos butted edge-to-edge with no border, sitting in a solid dark band) is an equally valid layout, use whichever fits the section.
- **Sharp corners** on gallery photos, same as the live site — no change there.

### Illustrated motifs (accent layer, not the primary visual)
Hand-drawn/ink-line or flat single-colour shapes, used as accents around and on top of photography — not as a replacement for it:
- **Envelopes** — sealed, half-open, mid-flight — section dividers, small accents near photo groups.
- **Postmarks / postage stamps** — circular date-stamp marks used as badges, corner decorations, "verified" markers, section numbering (step 1/2/3 as stamp numerals).
- **Wax seals** — CTA button treatment (a rounded seal shape, pressed-in look on click) and as "like" affordance. Also appears literally in `social-media-inspo.png` as a gold circle motif — keep gold/amber for this specific shape.
- **Terracotta stars** (new, from `social-media-inspo.png`) — small filled or outline stars scattered near photos and CTAs, echoing the inspo's star accents.
- **Handwritten marginalia** — small ink annotations, arrows, underlines (Caveat font) pointing at key phrases.

Avoid: emoji, flat vector "SaaS illustration" people, gradients, drop-shadowed 3D icons, anything glassy/neon. (Pixel art is no longer avoided — Jersey 25 itself is the pixel element; see §4.)

---

## 7. Components

### Buttons
- **Primary CTA:** wax-seal pill — terracotta fill, cream text, **Jersey 25** label (not Fraunces — see §4), subtle pressed/embossed inner shadow; on click, a brief "stamp down" scale (0.96) + settle, echoing a wax seal press. The pixel-outline "NEXT" button in `social-media-inspo.png` is a good literal reference for a secondary/nav-style button variant.
- **Secondary:** outline button, ink or terracotta 1.5px border on parchment, no fill, Jersey label.
- Both remain pill or rounded-rect (soft corners, not the sharp corners of the old design) — but softer radius (`0.5-0.75rem`), not the fully-pill `9999px` of the current brand.

### Nav
- Fixed top bar, parchment background (not glass-blur navy) with a thin ink or terracotta hairline border-bottom on scroll.
- Wordmark left (brand logo image, unchanged), 2-3 nav links right in Jersey, current section indicated by a short hand-drawn underline rather than a filled pill.

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
- ALL-CAPS Jersey eyebrows/labels are back in play (rev. 2) — same wide-tracked uppercase pixel-label treatment as the live site, just set in ink/terracotta on parchment instead of white-on-navy.
- Keep sentences short despite the literary tone — this is still a landing page, not a short story.
- No site copy changes as part of this revision — this section governs voice for *future* copy work only.

---

## 10. Hard rules

- No navy, no glass/blur surfaces, no black-speckle photo grain, no gradient-clip headline text — those belong to the old brand's *surface* and actively fight this one.
- Jersey 25 and real candid photography stay — this direction is a re-skin of the existing brand's palette and photo grade, not a wholesale identity swap (rev. 2).
- No neon/fluorescent brightness anywhere, including in Jersey type or the wax-seal gold — everything is matte and slightly muted, even the "loud" terracotta and yellow.
- No pure white or pure black anywhere.
- Two working typefaces (Jersey 25 + Helvetica); Caveat is a micro-accent only, never body or a full heading.
- No flat SaaS card grids — every card is a "letter" with a torn edge, rotation, and warm shadow.
- No cool-toned shadows or gradients.
- Photography is the primary visual (rev. 2); illustrated motifs (envelopes, postmarks, wax seals, stars) are accents around and on photos, not a replacement for them.

## Litmus checks

- Would this still feel right printed in sepia ink on cream paper?
- Does the hero read as a keepsake, not a dashboard?
- Are terracotta and yellow the two working accents, with burgundy/rose only ever in a minor supporting role?
- Do the photos look sun-faded and warm, never dark/moody or crisp/modern?
- If every wax-seal/postmark/star motif were removed, would the page still feel warm and in-brand from type, colour, and photo grade alone? (It should — motifs support the direction, they aren't the whole direction.)

---
*Written 2026-07-07. Revised 2026-07-07 (rev. 2) — proposed direction, review before implementation.*
