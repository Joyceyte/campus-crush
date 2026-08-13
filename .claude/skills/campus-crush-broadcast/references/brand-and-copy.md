# Brand and Copy — Campus Crush broadcast email

Everything here is already implemented in `scripts/template.mjs`. Read this to
write copy that fits, and to know what you may not change.

## Design tokens

Matching the site and the waitlist welcome email in `app/api/waitlist/route.ts`.

| Token | Value | Used for |
|-------|-------|----------|
| Page | `#F7EFE1` | Parchment surround |
| Surface | `#FFFBF3` | Warm off-white content column |
| Card | `#EFE3CD` | Cream — callout panels, footer band |
| Accent | `#C1512F` | Terracotta — masthead, subheadings, CTA button |
| On-accent | `#FFF6EA` | Text on terracotta |
| Ink | `#2B1B12` | h1, bolded text |
| Body text | `rgba(43,27,18,0.78)` | Paragraphs |
| Muted | `rgba(43,27,18,0.55)` | Sign-off |
| Faint | `rgba(43,27,18,0.5)` | Footer, unsubscribe |
| Hairline | `rgba(43,27,18,0.14)` | Rules and dividers |

| Type | Stack | Where |
|------|-------|-------|
| Display | `'Jersey 25','Arial Narrow',Arial,sans-serif`, `letter-spacing:0.06em` | Masthead (24px), h1 (34px), h2 (21px, uppercase) |
| Body | system sans stack | Paragraphs (16px / 1.65), sign-off (15px), footer (12px) |

Jersey 25 loads via a Google Fonts `<link>`. Apple Mail and iOS render it;
Gmail and Outlook fall back to Arial Narrow. That is fine — the layout does not
depend on the display face. Never make the fallback illegible by relying on the
condensed width.

Layout is fixed and deliberately **not** a floating rounded card: a full-width
terracotta masthead, a 600px content column with squared edges and 40px padding,
and a cream footer band. Brand colour carries the structure — it bands the
masthead, marks every subheading (uppercase, with a 44px rule under it), fills
the button, and edges the callout panel. Tables with inline styles throughout;
do not switch to divs, flexbox, or an external stylesheet — Outlook strips all
three.

Give any email longer than three paragraphs at least one `h2`. A wall of flat
paragraphs is what makes an email look amateur; the coloured subheadings are
the main thing doing the professional-looking work.

## Voice

Campus Crush talks like a friend who set you up on a date, not a brand.

- **Warm and direct.** Short sentences. Contractions. Second person.
- **Australian student register.** "uni", not "college". No US spellings.
- **A little cheeky, never leering.** The product is food dates between
  strangers — safety and consent are load-bearing. Flirty about *food*, matter
  of fact about *matching*.
- **Concrete over hype.** "You'll get a name, a time, and a café" beats
  "an unforgettable experience".
- **One emoji maximum**, and only where the site already uses one (💘). Never
  in the subject line — it trips student-mail spam filters more than consumer
  Gmail does.

Avoid: "Hey there!", "We're thrilled to announce", "game-changing", "Don't miss
out", "revolutionise", exclamation stacking, and anything that reads like it was
written by a growth team.

## Subject lines

- 30–45 characters. University webmail truncates hard on mobile.
- Lead with the thing that changed: "Accounts are live", "Your match is booked".
- No emoji, no ALL CAPS, no "RE:" or "FWD:" fakery.
- Don't put the CTA in the subject — that is the preview text's job.

## Preview text

Always set `previewText`. If you leave it empty the inbox scrapes the first body
line, which is usually redundant with the heading.

- 40–90 characters. It sits next to the subject in the list view.
- Extend the subject, don't repeat it. Subject: "Accounts are live" → preview:
  "Two minutes to set up, then we start matching."
- The template pads it with zero-width characters so Gmail can't pull body copy
  in behind it.

## Personalisation

Use `{{{FIRST_NAME|there}}}` with a fallback, always. Most contacts on this
account were imported without a first name, so an un-defaulted variable renders
as an empty gap. Triple braces, case-sensitive.

## Mandatory footer

`template.mjs` emits this and `draft` aborts if the unsubscribe token is
missing. Keep both lines:

```text
You're receiving this because you signed up for Campus Crush.
Unsubscribe   →   {{{RESEND_UNSUBSCRIBE_URL}}}
```

Override `footerNote` to be more specific about the list when it helps trust —
e.g. "You're receiving this because you joined the Campus Crush waitlist" — but
never remove it, and never remove the unsubscribe link. Under Australian spam
law a functional unsubscribe and an accurate sender identity are not optional,
and these are student addresses at institutions that will notice.
