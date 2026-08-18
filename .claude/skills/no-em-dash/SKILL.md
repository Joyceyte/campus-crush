---
name: no-em-dash
description: Enforces a zero-em-dash rule on Campus Crush's user-facing website copy. Use whenever writing or editing any text a visitor can read — hero headlines, section copy, FAQ answers, popup/modal text (e.g. WaitlistModal, JoinPilotModal, FoundersNote), button labels, alt text, meta titles/descriptions, blog post content, or transactional/broadcast email copy. Trigger on requests like "add copy", "write a headline", "update the FAQ", "add a message to the popup", "write the email", or any edit that touches a JSX text node, .md blog post, or email template. Does not apply to code comments.
---

# No em dash on the website

Campus Crush copy never uses the em dash (`—`, `&mdash;`, `—`). This is
already called out in `STYLE_GUIDE.md` §9 ("Voice & tone") but has been
violated before (see history — an em dash landed in `FoundersNote.tsx` and
had to be caught after the fact) — so this skill exists to catch it *before*
the edit lands, not after.

## Where this applies

Any text a site visitor, email recipient, or search engine can actually read:

- JSX text nodes and string props (headings, body copy, button labels, `alt`,
  `aria-label`, `placeholder`)
- Popup/modal copy — `WaitlistModal.tsx`, `JoinPilotModal.tsx`,
  `FoundersNote.tsx`
- FAQ answers (`FAQ.tsx`) — note the existing FAQ answers currently contain
  em dashes; leave those as-is unless the user asks for a copy pass, but
  never add a new one
- Blog content (`app/blog/`, any markdown rendered via `MarkdownContent.tsx`)
- Metadata (`<title>`, `description`, OpenGraph strings in `layout.tsx`)
- Email templates (`lib/emails/*.ts`, the broadcast skill's rendered output)

This rule does **not** apply to `//` or `{/* */}` code comments — those are
for developers reading the source, not visitors reading the site, and the
codebase uses em dashes in comments constantly (grep `app/ components/ lib/`
for `—` and you'll find ~100 comment hits). Don't "fix" those.

## What to do instead

Reach for whatever the em dash was standing in for:

| Em dash was doing this job | Use instead |
|---|---|
| Joining two related clauses | A period. Two sentences. |
| An aside / parenthetical | Parentheses, or a comma pair |
| Introducing a list or example | A colon |
| "and" / "but" | Just write "and" / "but" |

Example, the fix already applied in `FoundersNote.tsx`:

- Before: `to any uni student — undergrad, masters, or PhD.`
- After: `to any uni student, whether you're doing undergrad, masters, or PhD.`

## Before finishing an edit

Grep the specific string(s) you just wrote for the em dash character, not the
whole file (the file may already contain em dashes in comments or untouched
copy):

```bash
grep -n $'\xe2\x80\x94\|&mdash;' <the lines you added>
```

If you find one in copy you're adding, rewrite it per the table above. If
it's in a comment, leave it.
