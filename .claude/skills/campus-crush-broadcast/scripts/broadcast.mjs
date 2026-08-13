#!/usr/bin/env node
/**
 * Campus Crush broadcast CLI.
 *
 * Run from the repo root:
 *   node .claude/skills/campus-crush-broadcast/scripts/broadcast.mjs <command>
 *
 * Resolves `resend` from the project's node_modules by walking up from this
 * file, so it only works inside the repo — that is deliberate. The API key is
 * read from .env.local (or the ambient environment) and never written anywhere.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { Resend } from "resend";
import {
  renderBroadcast,
  renderBroadcastText,
  checkBrandFormatting,
  UNSUBSCRIBE_TOKEN,
} from "./template.mjs";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const DEFAULT_FROM = "Campus Crush <hello@campus-crush.org>";
/** Resend's documented default rate limit is 2 requests/second. */
const RATE_LIMIT_DELAY_MS = 550;

function die(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

/**
 * Minimal .env parser — avoids adding a dotenv dependency for one file.
 *
 * Always parses the whole file. An earlier version bailed out as soon as
 * RESEND_API_KEY was present in the ambient environment, which silently hid
 * every other key in .env.local (notably SUPABASE_SERVICE_ROLE_KEY).
 * Ambient environment still wins per-key.
 */
const ENV_KEYS_SEEN = new Set();

function loadEnvLocal() {
  let raw = "";
  try {
    raw = readFileSync(join(REPO_ROOT, ".env.local"), "utf8");
  } catch {
    if (!process.env.RESEND_API_KEY) {
      die("No RESEND_API_KEY in the environment and .env.local could not be read.");
    }
  }
  for (const line of raw.split("\n")) {
    if (/^\s*(#|$)/.test(line)) continue;
    const match = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/.exec(line);
    if (!match) continue;
    const [, key, value] = match;
    ENV_KEYS_SEEN.add(key);
    if (process.env[key] === undefined) {
      process.env[key] = value.replace(/^["']|["']$/g, "");
    }
  }
  if (!process.env.RESEND_API_KEY) die("RESEND_API_KEY not found in .env.local.");
}

/** Key names only — never values. For diagnosing a misnamed variable. */
function knownEnvKeys(filter) {
  return [...ENV_KEYS_SEEN].filter((k) => filter.test(k)).join(", ") || "(none)";
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Unwrap Resend's { data, error } — the SDK does not throw on API errors. */
function unwrap(result, what) {
  if (result.error) {
    die(`${what} failed: ${result.error.message ?? JSON.stringify(result.error)}`);
  }
  return result.data;
}

function loadConfig(path) {
  if (!path) die("Missing <config.json> path.");
  let config;
  try {
    config = JSON.parse(readFileSync(resolve(path), "utf8"));
  } catch (err) {
    die(`Could not read config ${path}: ${err.message}`);
  }
  for (const field of ["subject", "heading", "blocks"]) {
    if (!config[field]) die(`Config is missing required field \`${field}\`.`);
  }
  return config;
}

function render(config) {
  return {
    html: renderBroadcast(config),
    text: renderBroadcastText(config),
  };
}

function writePreview(html, slug, outPath) {
  const target =
    outPath ?? join(tmpdir(), "campus-crush-broadcast", `${slug}.html`);
  mkdirSync(dirname(target), { recursive: true });

  // The unsubscribe token only resolves at Resend send time; neutralise it so
  // the local preview does not render a broken link.
  let preview = html.replaceAll(UNSUBSCRIBE_TOKEN, "#unsubscribe-preview");

  // Point campus-crush.org asset URLs at the local file in public/ when one
  // exists, so a preview renders correctly for images that are committed but
  // not yet deployed. Recipients still get the real URL — this rewrite only
  // ever touches the preview file.
  preview = preview.replace(
    /https:\/\/campus-crush\.org\/([^"')\s]+\.(?:jpe?g|png|webp|gif|avif))/gi,
    (url, asset) => {
      const local = join(REPO_ROOT, "public", asset);
      return existsSync(local) ? `file://${local}` : url;
    }
  );

  writeFileSync(target, preview);
  return target;
}

/** True when the email references an asset that is not yet reachable in prod. */
async function reportUndeployedAssets(html) {
  const urls = [...new Set(
    [...html.matchAll(/https:\/\/campus-crush\.org\/[^"')\s]+\.(?:jpe?g|png|webp|gif|avif)/gi)].map((m) => m[0])
  )];
  const missing = [];
  for (const url of urls) {
    try {
      const res = await fetch(url, { method: "HEAD" });
      if (!res.ok) missing.push(`${url} (HTTP ${res.status})`);
    } catch {
      missing.push(`${url} (unreachable)`);
    }
  }
  return missing;
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50) || "broadcast";
}

// ── commands ────────────────────────────────────────────────────────────────

async function cmdSegments(resend) {
  const segments = unwrap(await resend.segments.list(), "segments.list");
  console.log("Segments\n");
  for (const segment of segments.data) {
    await sleep(RATE_LIMIT_DELAY_MS);
    const contacts = await resend.contacts.list({ segmentId: segment.id });
    let summary;
    if (contacts.error) {
      summary = `count unavailable (${contacts.error.message})`;
    } else {
      const rows = contacts.data.data;
      const subscribed = rows.filter((c) => !c.unsubscribed).length;
      summary = `${subscribed} subscribed / ${rows.length} total${contacts.data.has_more ? "+ (paginated)" : ""}`;
    }
    console.log(`  ${segment.id}  ${segment.name}`);
    console.log(`  ${" ".repeat(38)}${summary}\n`);
  }
}

/**
 * Page through contacts (the API caps a page at 100).
 * Omit segmentId to list every contact in the account.
 */
async function listAllContacts(resend, segmentId) {
  const all = [];
  let after;
  for (;;) {
    const page = await resend.contacts.list({
      ...(segmentId ? { segmentId } : {}),
      limit: 100,
      ...(after ? { after } : {}),
    });
    const data = unwrap(page, "contacts.list");
    all.push(...data.data);
    if (!data.has_more || data.data.length === 0) break;
    after = data.data[data.data.length - 1].id;
    await sleep(RATE_LIMIT_DELAY_MS);
  }
  return all;
}

async function cmdSegmentCreate(resend, name) {
  if (!name) die("Missing <name>. Usage: segment-create \"UniMelb waitlist\"");
  const segment = unwrap(await resend.segments.create({ name }), "segments.create");
  console.log(`✓ Segment created: ${segment.id}  ${segment.name}`);
  console.log(`\n  Populate it with:  sync --segment ${segment.id} [--domain @example.edu] --apply`);
}

/**
 * Read the Supabase waitlist. The anon key cannot SELECT (RLS is insert-only),
 * so this needs SUPABASE_SERVICE_ROLE_KEY — a server-only secret. If you would
 * rather not put it in .env.local, export a CSV from the Supabase table editor
 * and pass --from-csv instead.
 */
async function readWaitlist(flags) {
  if (flags.fromCsv) {
    const rows = readFileSync(resolve(flags.fromCsv), "utf8").trim().split(/\r?\n/);
    const header = rows.shift().split(",").map((h) => h.trim().replace(/^"|"$/g, "").toLowerCase());
    const emailIdx = header.indexOf("email");
    const nameIdx = header.indexOf("name");
    if (emailIdx === -1) die(`CSV at ${flags.fromCsv} has no "email" column (found: ${header.join(", ")}).`);
    return rows
      .map((line) => {
        const cells = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
        return { email: cells[emailIdx], name: nameIdx === -1 ? null : cells[nameIdx] };
      })
      .filter((r) => r.email);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) die("NEXT_PUBLIC_SUPABASE_URL missing from .env.local.");
  if (!key) {
    die(
      "SUPABASE_SERVICE_ROLE_KEY is not set.\n" +
        `  Supabase-ish keys found in .env.local: ${knownEnvKeys(/SUPABASE|SERVICE|ROLE/i)}\n` +
        "  The anon key cannot read the waitlist (RLS is insert-only).\n" +
        "  Either add the service-role key to .env.local as SUPABASE_SERVICE_ROLE_KEY\n" +
        "  (Supabase dashboard → Project Settings → API Keys → service_role), or\n" +
        "  export the waitlist as CSV and re-run with:  sync --from-csv <path>"
    );
  }

  const rows = [];
  const pageSize = 1000;
  for (let offset = 0; ; offset += pageSize) {
    const res = await fetch(
      `${url}/rest/v1/waitlist?select=email,name&order=created_at.asc&limit=${pageSize}&offset=${offset}`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } }
    );
    if (!res.ok) die(`Supabase read failed: HTTP ${res.status} ${await res.text()}`);
    const page = await res.json();
    rows.push(...page);
    if (page.length < pageSize) break;
  }
  return rows;
}

/**
 * Add Supabase waitlist members who are missing from a Resend segment.
 * Additive only — never unsubscribes or deletes, so a stale row in Supabase
 * cannot resurrect someone who opted out in Resend.
 */
async function cmdSync(resend, flags) {
  const segmentId = flags.segment ?? "191cb508-6f66-4153-b078-7be7d17d0abb";
  const domain = flags.domain?.trim().toLowerCase();

  const allRows = await readWaitlist(flags);
  const waitlist = domain
    ? allRows.filter((r) => r.email?.trim().toLowerCase().endsWith(domain))
    : allRows;

  // Account-wide contacts, so someone already in another segment is reused
  // rather than re-created (which would fail as a duplicate).
  const accountContacts = await listAllContacts(resend);
  const byEmail = new Map(accountContacts.map((c) => [c.email.trim().toLowerCase(), c.id]));
  const inSegment = new Set(
    (await listAllContacts(resend, segmentId)).map((c) => c.email.trim().toLowerCase())
  );

  const seen = new Set();
  const missing = [];
  for (const row of waitlist) {
    const email = row.email?.trim().toLowerCase();
    if (!email || seen.has(email) || inSegment.has(email)) continue;
    seen.add(email);
    missing.push({
      email,
      firstName: (row.name ?? "").trim().split(/\s+/)[0] || undefined,
      existingId: byEmail.get(email),
    });
  }

  console.log(`Segment ${segmentId}`);
  if (domain) {
    console.log(`  Filter:            ${domain}  (${waitlist.length} of ${allRows.length} waitlist rows)`);
  }
  console.log(`  Eligible:          ${waitlist.length}`);
  console.log(`  Already in segment:${String(inSegment.size).padStart(4)}`);
  console.log(`  Missing:           ${missing.length}\n`);

  if (missing.length === 0) {
    console.log("✓ Segment is already in sync.");
    return;
  }

  for (const m of missing.slice(0, 10)) {
    console.log(`    + ${m.email}${m.firstName ? ` (${m.firstName})` : ""}${m.existingId ? " [existing contact]" : ""}`);
  }
  if (missing.length > 10) console.log(`    … and ${missing.length - 10} more`);

  if (!flags.apply) {
    console.log(`\n  Dry run. Re-run with --apply to add these ${missing.length} contacts.`);
    return;
  }

  let added = 0;
  const failed = [];
  for (const m of missing) {
    const res = m.existingId
      ? await resend.contacts.segments.add({ contactId: m.existingId, segmentId })
      : await resend.contacts.create({
          email: m.email,
          firstName: m.firstName,
          segments: [{ id: segmentId }],
        });
    if (res.error) failed.push(`${m.email}: ${res.error.message}`);
    else added++;
    await sleep(RATE_LIMIT_DELAY_MS);
  }

  console.log(`\n✓ Added ${added} contact(s).`);
  if (failed.length) {
    console.log(`✗ ${failed.length} failed:`);
    for (const f of failed) console.log(`    ${f}`);
    process.exitCode = 1;
  }
}

async function cmdList(resend) {
  const broadcasts = unwrap(await resend.broadcasts.list(), "broadcasts.list");
  console.log("Broadcasts\n");
  for (const b of broadcasts.data) {
    const when = b.sent_at ?? b.scheduled_at ?? b.created_at;
    console.log(`  ${b.status.padEnd(9)} ${b.id}  ${b.name ?? "(unnamed)"}  ${when}`);
  }
}

async function cmdDraft(resend, configPath, flags) {
  const config = loadConfig(configPath);
  if (!config.segmentId) die("Config is missing `segmentId`. Run `segments` to find it.");

  const { html, text } = render(config);

  // Brand formatting is not optional. If the rendered HTML is not on-brand,
  // stop here rather than let an unstyled email reach a segment.
  const problems = checkBrandFormatting(html);
  if (problems.length) {
    die(
      "Rendered HTML failed the brand formatting check — refusing to create the draft:\n" +
        problems.map((p) => `    - ${p}`).join("\n")
    );
  }

  const previewPath = writePreview(html, slugify(config.name ?? config.subject), flags.out);

  // Always a draft. Sending is a separate, explicitly confirmed step.
  const draft = unwrap(
    await resend.broadcasts.create({
      name: config.name ?? config.subject,
      from: config.from ?? DEFAULT_FROM,
      replyTo: config.replyTo,
      subject: config.subject,
      previewText: config.previewText,
      segmentId: config.segmentId,
      html,
      text,
    }),
    "broadcasts.create"
  );

  console.log(`✓ Draft created: ${draft.id}`);
  console.log(`  Subject:  ${config.subject}`);
  console.log(`  Segment:  ${config.segmentId}`);
  console.log(`  Preview:  ${previewPath}`);

  const missing = await reportUndeployedAssets(html);
  if (missing.length) {
    console.log(`\n  ⚠ NOT YET DEPLOYED — recipients would see a broken image:`);
    for (const m of missing) console.log(`      ${m}`);
    console.log(`    The preview above uses the local file. Deploy before sending.`);
  }

  console.log(`\n  open ${previewPath}`);
  console.log(`  …then, after approval:  send ${draft.id} --yes`);
}

async function cmdPreview(resend, id, flags) {
  if (!id) die("Missing <broadcast-id>.");
  const broadcast = unwrap(await resend.broadcasts.get(id), "broadcasts.get");
  console.log(`Broadcast ${broadcast.id}`);
  console.log(`  Name:      ${broadcast.name ?? "(unnamed)"}`);
  console.log(`  Status:    ${broadcast.status}`);
  console.log(`  Segment:   ${broadcast.segment_id ?? broadcast.audience_id}`);
  console.log(`  Scheduled: ${broadcast.scheduled_at ?? "—"}`);
  console.log(`  Sent:      ${broadcast.sent_at ?? "—"}`);
  if (broadcast.html) {
    const path = writePreview(broadcast.html, slugify(broadcast.name ?? broadcast.id), flags.out);
    console.log(`  Preview:   ${path}`);
  }
}

async function cmdSend(resend, id, flags) {
  if (!id) die("Missing <broadcast-id>.");
  if (!flags.yes) {
    die(
      "Refusing to send without --yes.\n" +
        "  Confirm the subject line, the segment, and the recipient count with the user first,\n" +
        "  then re-run with --yes."
    );
  }

  const broadcast = unwrap(await resend.broadcasts.get(id), "broadcasts.get");
  if (broadcast.status !== "draft") {
    die(`Broadcast ${id} is already "${broadcast.status}" — nothing to send.`);
  }

  // Last line of defence: a broadcast created outside this tool (dashboard,
  // raw API) would never have passed the draft-time check.
  const brandProblems = checkBrandFormatting(broadcast.html ?? "");
  if (brandProblems.length && !flags.allowUnbranded) {
    die(
      `Refusing to send — broadcast ${id} is not on-brand:\n` +
        brandProblems.map((p) => `    - ${p}`).join("\n") +
        `\n  Re-create it with \`draft\`, or pass --allow-unbranded to override.`
    );
  }

  // A broken hero image cannot be fixed after the send. Block on it.
  const missing = await reportUndeployedAssets(broadcast.html ?? "");
  if (missing.length && !flags.allowMissingAssets) {
    die(
      `Refusing to send — these assets are not reachable in production:\n` +
        missing.map((m) => `    ${m}`).join("\n") +
        `\n  Deploy them first, or pass --allow-missing-assets to override.`
    );
  }

  const payload = flags.at ? { scheduledAt: flags.at } : undefined;
  unwrap(await resend.broadcasts.send(id, payload), "broadcasts.send");
  console.log(flags.at ? `✓ Scheduled ${id} for ${flags.at}` : `✓ Sent ${id}`);
}

async function cmdTest(resend, configPath, flags) {
  if (!flags.to) die("Missing --to <address>. Use delivered@resend.dev for a smoke test.");
  const config = loadConfig(configPath);
  const { html, text } = render(config);

  // A one-off send is not a broadcast, so Resend performs no substitution:
  // neither the unsubscribe token nor {{{VAR|fallback}}} merge tags resolve.
  // Do it here, otherwise the test mail shows raw mustache to the reviewer and
  // the test stops representing what recipients actually get.
  const localize = (s) =>
    s
      .replaceAll(UNSUBSCRIBE_TOKEN, "https://campus-crush.org")
      // {{{NAME|fallback}}} -> fallback   |   {{{NAME}}} -> ""
      .replace(/\{\{\{\s*[A-Z0-9_]+\s*\|([^}]*)\}\}\}/gi, (_, fallback) => fallback.trim())
      .replace(/\{\{\{\s*[A-Z0-9_]+\s*\}\}\}/gi, "");

  const testHtml = localize(html);
  const testText = localize(text);

  const sent = unwrap(
    await resend.emails.send({
      from: config.from ?? DEFAULT_FROM,
      to: flags.to,
      replyTo: config.replyTo,
      subject: `[TEST] ${config.subject}`,
      html: testHtml,
      text: testText,
    }),
    "emails.send"
  );
  console.log(`✓ Test email sent to ${flags.to} (${sent.id})`);
}

function usage() {
  console.log(`campus-crush broadcast CLI

  segments                        List segments with subscriber counts
  segment-create <name>           Create a new (empty) segment
  sync [--segment ID] [--domain @x.edu] [--apply]
                                  Add Supabase waitlist members missing from a
                                  segment. Dry run unless --apply. Additive only.
                                  Needs SUPABASE_SERVICE_ROLE_KEY, or use
                                  --from-csv <path> with a Supabase CSV export.
  list                            List broadcasts and their status
  draft <config.json> [--out P]   Render + create a DRAFT, write an HTML preview
  preview <id> [--out P]          Show a broadcast's status and dump its HTML
  send <id> --yes [--at "<when>"] Send or schedule an approved draft
  test <config.json> --to <addr>  Send the rendered email to one address

Config fields: subject, heading, blocks (required); segmentId (required for
draft); name, previewText, from, replyTo, cta, signoff, footerNote (optional).`);
}

// ── entry ───────────────────────────────────────────────────────────────────

async function main() {
  const argv = process.argv.slice(2);
  const command = argv[0];
  if (!command || command === "--help" || command === "-h") {
    usage();
    return;
  }

  const positional = [];
  const flags = {};
  for (let i = 1; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--yes") flags.yes = true;
    else if (arg === "--allow-missing-assets") flags.allowMissingAssets = true;
    else if (arg === "--allow-unbranded") flags.allowUnbranded = true;
    else if (arg === "--apply") flags.apply = true;
    else if (arg === "--at") flags.at = argv[++i];
    else if (arg === "--to") flags.to = argv[++i];
    else if (arg === "--out") flags.out = argv[++i];
    else if (arg === "--segment") flags.segment = argv[++i];
    else if (arg === "--domain") flags.domain = argv[++i];
    else if (arg === "--from-csv") flags.fromCsv = argv[++i];
    else if (arg.startsWith("--")) die(`Unknown flag: ${arg}`);
    else positional.push(arg);
  }

  loadEnvLocal();
  const resend = new Resend(process.env.RESEND_API_KEY);

  switch (command) {
    case "segments":
      return cmdSegments(resend);
    case "sync":
      return cmdSync(resend, flags);
    case "segment-create":
      return cmdSegmentCreate(resend, positional[0]);
    case "list":
      return cmdList(resend);
    case "draft":
      return cmdDraft(resend, positional[0], flags);
    case "preview":
      return cmdPreview(resend, positional[0], flags);
    case "send":
      return cmdSend(resend, positional[0], flags);
    case "test":
      return cmdTest(resend, positional[0], flags);
    default:
      usage();
      die(`Unknown command: ${command}`);
  }
}

main().catch((err) => die(err.stack ?? err.message));
