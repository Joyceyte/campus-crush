---
quick_id: 260813-gqu
status: planned
date: 2026-08-13
---

# Quick Task 260813-gqu: campus-crush-broadcast project skill

Create a project skill at `.claude/skills/campus-crush-broadcast/` that renders
brand-styled HTML emails and sends them as Resend broadcasts to a segment, with
a mandatory draft → preview → approve → send gate.

## Established facts (verified, do not re-derive)

- `resend@6.14.0` in `node_modules`; `lib/resend.ts` exports `resend` and
  `WELCOME_FROM = "Campus Crush <hello@campus-crush.org>"`.
- `campus-crush.org` verified for sending (us-east-1, receiving disabled).
- Segments and audiences share IDs on this account:
  - `191cb508-6f66-4153-b078-7be7d17d0abb` — "Waitlist as of 5 Aug" (populated)
  - `f311c7a1-f715-47f3-8f37-d6b61422a085` — "General"
- SDK surface: `broadcasts.create|send|list|get|update|remove`,
  `segments.list|get`, `contacts.list({ segmentId })`. `segmentId` is the
  current field; `audienceId` is deprecated. All calls return `{ data, error }`.
- Brand email design system lives in `app/api/waitlist/route.ts::welcomeHtml()`.

## Tasks

1. **`scripts/template.mjs`** — `renderBroadcast()` / `renderBroadcastText()`
   producing the parchment/terracotta shell with a hidden preheader, optional
   CTA button, and a mandatory `{{{RESEND_UNSUBSCRIBE_URL}}}` footer.
   - verify: `node -e "import('./…/template.mjs').then(m=>…)"` renders HTML
     containing the unsubscribe token and the preheader.
2. **`scripts/broadcast.mjs`** — zero-config CLI (`segments`, `list`, `draft`,
   `preview`, `send`, `test`) that loads `.env.local`, checks `error` on every
   SDK call, and exits non-zero on failure. Never passes `send: true` on create.
   - verify: `node …/broadcast.mjs segments` lists both segments with counts;
     `--help` exits 0.
3. **`SKILL.md` + `references/brand-and-copy.md`** — workflow-pattern skill with
   progress checklist, the approval gate, and a Gotchas table.
   - verify: frontmatter `name` matches the folder; every referenced file exists.

## Must haves

- No existing app code modified.
- No real email sent during this task.
- Skill never creates a broadcast in a sending state without explicit approval.
