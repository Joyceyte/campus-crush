---
quick_id: 260813-gqu
status: complete
date: 2026-08-13
---

# Quick Task 260813-gqu: campus-crush-broadcast project skill

Created `.claude/skills/campus-crush-broadcast/` — the project's first skill.

## Files created

| File | Purpose |
|------|---------|
| `SKILL.md` | Workflow skill: account facts, 7-step checklist, command table, gotchas |
| `references/brand-and-copy.md` | Design tokens, voice rules, subject/preview guidance, mandatory footer |
| `scripts/template.mjs` | `renderBroadcast()` / `renderBroadcastText()` / `esc()` |
| `scripts/broadcast.mjs` | CLI: `segments`, `sync`, `list`, `draft`, `preview`, `send`, `test` |

## Design decisions

- **The approval gate is enforced in code, not just prose.** `draft` never passes
  `send: true`, and `send` exits 1 without `--yes`. A model that skims SKILL.md
  still cannot send without an explicit second step.
- **`draft` aborts if the rendered HTML lacks `{{{RESEND_UNSUBSCRIBE_URL}}}`.**
- **Previews are written to `os.tmpdir()`**, not the repo — one-off campaign
  artifacts should not accumulate in git.
- **CLI uses the project's installed `resend@6.14.0`** (resolved by walking up
  from the script to the repo's `node_modules`), so it stays aligned with
  `lib/resend.ts`. The tradeoff is that the skill is repo-bound, not portable to
  `~/.claude/skills/`.
- **Broadcast layout deliberately diverges from the welcome email.** The welcome
  email is a 480px rounded card; broadcasts use a full-width terracotta masthead
  over a 600px squared column, with terracotta uppercase subheadings, a callout
  panel, and an optional hero image. Marketing email needs scannable hierarchy
  that a one-paragraph transactional receipt does not. The palette is shared,
  the layout is not — so no shared module, and the two can move independently.
- **Asset liveness is a hard gate, not a warning.** `draft` reports any
  `campus-crush.org` asset that 404s and `send` refuses outright, because a
  broken hero image cannot be fixed after a broadcast leaves. Preview files
  rewrite site URLs to local `public/` paths so a design can be reviewed before
  the asset is deployed; the rewrite never touches what is stored or sent.
- **`sync` is additive only.** It never unsubscribes or deletes, so a stale
  Supabase row cannot resurrect someone who opted out in Resend. Dry run is the
  default; `--apply` is required to write.

## Verification

| Check | Result |
|-------|--------|
| Template renders all block types, preheader, CTA, unsubscribe token | 10/10 assertions pass |
| Plain-text fallback strips tags, keeps unsubscribe | pass |
| `--help`, `segments`, `list`, `preview` | exit 0, live data correct (152 subscribed in waitlist segment) |
| `draft` against the live account | created `391cc083…`, preview written, then deleted — account restored to its original 2 broadcasts |
| `send` without `--yes` / unknown flag / missing config | all exit 1 with actionable messages |
| `test` (single send) | **not executed** — would send real email |
| Existing app code | unmodified |

## Follow-up worth knowing

**The waitlist segment is 38 contacts short.** Supabase `waitlist` holds 190
rows (via the `waitlist_count` RPC); the "Waitlist as of 5 Aug" segment holds
152. The `sync` command closes this, but it is **blocked on credentials**: the
anon key cannot `SELECT` from `waitlist` (RLS is insert-only, which is why the
app reads the count through a `SECURITY DEFINER` RPC). It needs either
`SUPABASE_SERVICE_ROLE_KEY` in `.env.local` or a CSV export via `--from-csv`.
The diff/dedup path is verified against the live segment through the CSV route.
