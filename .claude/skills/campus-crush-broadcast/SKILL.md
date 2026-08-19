---
name: campus-crush-broadcast
description: Composes and sends brand-styled Resend broadcast emails to Campus Crush waitlist and student segments, with a mandatory draft-preview-approve gate before anything goes out. Use when the user says "send a broadcast", "email the waitlist", "email blast", "send a newsletter", "announcement to students", "email everyone about the launch", "message the founding members", "schedule an email to the list", or asks to draft, preview, schedule, or check the status of a marketing email. Not for transactional one-off email (welcome, receipts) — that goes through lib/resend.ts directly.
---

# Campus Crush Broadcast Email

Sends marketing/announcement email to a Resend **segment**. Every send goes to
real Melbourne students on their university addresses — a bad send cannot be
recalled and damages the domain's sending reputation. The workflow below is
built around that.

## Brand formatting is mandatory

**Never hand-write email HTML, and never paste HTML from a doc, the Resend
dashboard, or an AI draft into a broadcast.** All copy goes through
`renderBroadcast()` in `scripts/template.mjs`, which applies the Campus Crush
formatting: terracotta masthead, optional hero image, terracotta uppercase
subheadings, callout panel, brand button, cream footer with the unsubscribe
link, plus a plain-text alternative for deliverability.

This is enforced, not just requested. `checkBrandFormatting()` runs at two
points and **blocks** on failure:

- `draft` refuses to create the broadcast if the rendered HTML is not on-brand
- `send` re-checks the stored HTML, which catches anything created outside this
  tool (dashboard, raw API) — override only with `--allow-unbranded`

It verifies the DOCTYPE, masthead band, both font stacks, surface and footer
colours, the unsubscribe token, table-based layout, and the absence of flexbox.
If you are tempted to override it, re-create the email with `draft` instead.

You write **content** (subject, heading, blocks, CTA); the template owns
**presentation**. Do not put layout HTML in a block — only inline emphasis like
`<strong>`, `<em>`, `<a>`.

## Account facts

| Thing | Value |
|-------|-------|
| Verified sending domain | `campus-crush.org` (us-east-1, sending only) |
| Default `from` | `Campus Crush <hello@campus-crush.org>` |
| Segment: all unis | `191cb508-6f66-4153-b078-7be7d17d0abb` — "Waitlist as of 5 Aug" (name is historical; kept in sync with Supabase) |
| Segment: UniMelb only | `c37556d9-eb70-4f87-8f1b-f1376899edfb` — "University of Melbourne waitlist" |
| Segment: general | `f311c7a1-f715-47f3-8f37-d6b61422a085` — "General" (empty) |
| API key | `RESEND_API_KEY` in `.env.local` (the CLI loads it; never print it) |

Run `segments` rather than trusting these IDs if a send matters — segments get
added and the counts drift.

## Workflow

Copy this checklist and work through it:

```text
Broadcast progress:
- [ ] Step 1: Confirm audience and goal with the user, then `sync` the segment
- [ ] Step 2: Write the config file
- [ ] Step 3: Create the draft and open the preview
- [ ] Step 4: Send a test to one real inbox
- [ ] Step 5: Get explicit approval — subject, segment, recipient count
- [ ] Step 6: Send or schedule
- [ ] Step 7: Report the broadcast ID back
```

All commands run from the repo root:

```bash
node .claude/skills/campus-crush-broadcast/scripts/broadcast.mjs <command>
```

### Step 1 — Confirm audience and goal

Run `segments` to get live names and subscriber counts. Ask the user which
segment and what the email needs to achieve. Do not guess the segment — the
waitlist spans five universities, so "everyone" and "UniMelb students" are
different sends.

Then reconcile the segment against Supabase, which is the source of truth:

```bash
node .../broadcast.mjs sync                      # dry run against the all-unis segment
node .../broadcast.mjs sync --apply              # add the missing contacts
node .../broadcast.mjs sync --segment <id> --domain @student.unimelb.edu.au --apply
```

Skipping this silently drops everyone who signed up since the segment was last
touched. Scan the dry-run output for obvious test rows before applying.

### Step 2 — Write the config file

Write a JSON config to the scratchpad (not the repo — these are one-offs).
Read `references/brand-and-copy.md` before writing any copy.

```json
{
  "name": "Accounts are live",
  "segmentId": "191cb508-6f66-4153-b078-7be7d17d0abb",
  "subject": "Your Campus Crush account is ready",
  "previewText": "Two minutes to set up, then we start matching.",
  "heading": "Accounts are live, {{{FIRST_NAME|friend}}}",
  "blocks": [
    "You joined the waitlist. Now you can actually make an account.",
    { "type": "h2", "text": "What happens next" },
    { "type": "list", "items": ["Sign in with your uni Google account", "Fill in your profile", "We match you for a food date"] }
  ],
  "cta": { "label": "Create your account", "url": "https://campus-crush.org/login" },
  "footerNote": "You're receiving this because you joined the Campus Crush waitlist."
}
```

Block types: bare string (paragraph), `{type:"h2"}` (terracotta uppercase
subheading with an accent rule), `{type:"list", items:[]}`, `{type:"callout"}`
(cream panel with a terracotta left edge — for the one line that must be read),
`{type:"divider"}`, `{type:"cta", label, url}` (the same Outlook-safe button
as the trailing `cta` config field, but placeable anywhere in the body — use
this instead of `cta` when the button needs to sit mid-email). Block content
is emitted as raw HTML so `<strong>` and `<a>` work — wrap any value from the
database in `esc()` from `template.mjs`.

Anything longer than three paragraphs needs at least one `h2`. Flat paragraph
walls are what make an email look amateur.

### Step 3 — Create the draft

```bash
node .claude/skills/campus-crush-broadcast/scripts/broadcast.mjs draft /path/to/config.json
```

Prints the draft ID and writes an HTML preview to a temp path. Open it and read
it as a recipient would. Fix and re-draft rather than patching a bad draft.

### Step 4 — Test send

```bash
node .../broadcast.mjs test /path/to/config.json --to hujoyce04@gmail.com
```

Use a real inbox the user owns to check rendering, or `delivered@resend.dev`
for a pure API smoke test. Never a made-up address at a real provider.

### Step 5 — Approval gate (mandatory)

Present to the user, and wait for an explicit yes:

- the exact subject line and preview text
- the segment name and how many people that is
- the send time (now, or the scheduled time)

`send` refuses to run without `--yes`. Do not pass `--yes` on the user's behalf
until they have approved these three things in this conversation.

### Step 6 — Send

```bash
node .../broadcast.mjs send <id> --yes                    # now
node .../broadcast.mjs send <id> --yes --at "in 2 hours"  # scheduled
```

`--at` takes ISO 8601 or natural language.

### Step 7 — Report

Give the user the broadcast ID and tell them `list` shows delivery status.

## Commands

| Command | Does |
|---------|------|
| `segments` | Lists segments with subscribed/total counts |
| `segment-create <name>` | Creates a new empty segment |
| `sync [--segment ID] [--domain @x.edu] [--apply]` | Adds Supabase waitlist members missing from a segment. Dry run unless `--apply`. Additive only — never unsubscribes or deletes |
| `list` | Lists broadcasts and their status |
| `draft <config.json> [--out path]` | Renders, creates a **draft**, writes an HTML preview |
| `preview <id> [--out path]` | Status of a broadcast + dumps its HTML |
| `send <id> --yes [--at "<when>"]` | Sends or schedules an approved draft |
| `test <config.json> --to <addr>` | Single send of the same HTML to one address |

## Gotchas

| Gotcha | What to do |
|--------|-----------|
| `audienceId` is deprecated | Use `segmentId`. Segments and audiences currently share IDs on this account, so old code still works — don't copy it. |
| `create({ send: true })` sends immediately | Never use it. `draft` deliberately omits it. The two-step gate is the whole point of this skill. |
| SDK never throws on API errors | It returns `{ data, error }`. Check `error` on every call — a `try/catch` alone will silently pass a failed send. |
| Variables need triple braces | `{{{FIRST_NAME|there}}}`, not `{{FIRST_NAME}}`. Names are case-sensitive. Most contacts on this account have `first_name: null`, so **always** supply a fallback. |
| Unsubscribe link is required | `{{{RESEND_UNSUBSCRIBE_URL}}}` — `template.mjs` adds it and `draft` aborts if it is missing. It only resolves for broadcasts, not for `test` sends. |
| Only drafts can be deleted or edited | Once sent or scheduled, `remove()` and `update()` fail. Cancel a scheduled send from the Resend dashboard. |
| Rate limit is 2 req/s | `segments` already paces itself. Don't hammer the API in a loop. |
| `from` domain must match exactly | Only `@campus-crush.org` is verified. A different domain returns 403. |
| Never test with fake addresses | `test@gmail.com` and friends bounce and hurt the domain's reputation. Use `delivered@resend.dev`. |
| Segment drifts from Supabase | Run `sync` before every send. Supabase `waitlist` is the source of truth; the segment is a copy. |
| The waitlist is multi-university | It is not all UniMelb. Confirm scope before sending, and use `sync --domain @student.unimelb.edu.au` into a dedicated segment for a single-uni send. |
| `sync` needs a service-role key | The anon key cannot `SELECT` from `waitlist` (RLS is insert-only). Needs `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`, or `--from-csv` with a dashboard export. |
| Merge tags do not resolve in `test` | `emails.send` performs no substitution, so `test` resolves `{{{VAR|fallback}}}` locally to keep the preview honest. Only a real broadcast does per-recipient substitution. |
| Images must be deployed first | Email clients cannot load local files or data URIs. `draft` warns and `send` blocks when a `campus-crush.org` asset 404s. |
| Test/junk rows reach real sends | Fake addresses hard-bounce and hurt deliverability. Scan the list for obvious test entries and remove them from the segment (not the account) before sending. |

## References

| File | Read when |
|------|-----------|
| `references/brand-and-copy.md` | Before writing any subject line, heading, or body copy |
