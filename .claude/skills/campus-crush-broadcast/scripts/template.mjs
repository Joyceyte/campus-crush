/**
 * Campus Crush broadcast email template.
 *
 * Layout: a full-width terracotta masthead over a 600px content column with
 * squared edges — an editorial/newsletter structure rather than the floating
 * rounded card used by the transactional welcome email in
 * `app/api/waitlist/route.ts`. Brand colour does the work: it bands the
 * masthead, marks every subheading, and fills the button.
 *
 * Table-based with inline styles throughout, which is the only layout that
 * survives Outlook and Gmail's CSS stripping.
 *
 * TRUST MODEL: `heading`, block content, and `cta.label` are emitted as raw
 * HTML so the author can use <strong>, <em>, <a>, and &nbsp;. You write this
 * copy yourself — it is not user input. If you ever interpolate a value from
 * the database or an API into a block, wrap it in `esc()` first.
 */

const PALETTE = {
  page: "#F7EFE1", // parchment — the surround
  surface: "#FFFBF3", // warm off-white — the content column
  card: "#EFE3CD", // cream — pull quotes / inset panels
  accent: "#C1512F", // terracotta — masthead, subheadings, button
  onAccent: "#FFF6EA", // cream text on terracotta
  ink: "#2B1B12", // deep brown — headings
  body: "rgba(43,27,18,0.78)",
  muted: "rgba(43,27,18,0.55)",
  faint: "rgba(43,27,18,0.5)",
  hairline: "rgba(43,27,18,0.14)",
};

const CONTENT_WIDTH = 600;

const HEADING_FONT =
  "font-family:'Jersey 25','Arial Narrow',Arial,sans-serif;letter-spacing:0.06em;";
const BODY_FONT =
  "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;";

/** Resend interpolates this at send time into a per-recipient opt-out link. */
export const UNSUBSCRIBE_TOKEN = "{{{RESEND_UNSUBSCRIBE_URL}}}";

/** Escape a dynamic value before putting it inside a block. */
export function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Normalize a block into { type, ...fields }.
 * A bare string is shorthand for a paragraph.
 */
function normalizeBlock(block) {
  if (typeof block === "string") return { type: "p", text: block };
  if (!block || typeof block !== "object" || !block.type) {
    throw new Error(
      `Invalid block: expected a string or { type: 'p' | 'h2' | 'list' | 'callout' | 'divider' }, got ${JSON.stringify(block)}`
    );
  }
  return block;
}

function renderBlock(block) {
  const b = normalizeBlock(block);
  switch (b.type) {
    case "p":
      return `<p style="margin:0 0 18px;font-size:16px;line-height:1.65;color:${PALETTE.body};">${b.text}</p>`;

    // Subheading: terracotta, with a short rule beneath it so sections read as
    // sections even when Jersey 25 falls back to Arial Narrow.
    case "h2":
      return `<h2 style="margin:34px 0 6px;${HEADING_FONT}font-size:21px;line-height:1.3;color:${PALETTE.accent};text-transform:uppercase;">${b.text}</h2>
                <div style="width:44px;height:3px;line-height:3px;font-size:3px;background:${PALETTE.accent};margin:0 0 16px;">&nbsp;</div>`;

    case "list": {
      const items = (b.items ?? [])
        .map(
          (item) =>
            `<tr>
                    <td valign="top" style="padding:0 10px 10px 0;${BODY_FONT}font-size:16px;line-height:1.65;color:${PALETTE.accent};font-weight:700;">&bull;</td>
                    <td valign="top" style="padding:0 0 10px;${BODY_FONT}font-size:16px;line-height:1.65;color:${PALETTE.body};">${item}</td>
                  </tr>`
        )
        .join("\n                  ");
      return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 18px;">
                  ${items}
                </table>`;
    }

    // Inset panel for the one thing you want read if nothing else is.
    case "callout":
      return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 22px;">
                  <tr>
                    <td style="background:${PALETTE.card};border-left:4px solid ${PALETTE.accent};padding:18px 20px;${BODY_FONT}font-size:16px;line-height:1.6;color:${PALETTE.ink};">${b.text}</td>
                  </tr>
                </table>`;

    case "divider":
      return `<div style="height:1px;line-height:1px;font-size:1px;background:${PALETTE.hairline};margin:30px 0;">&nbsp;</div>`;

    default:
      throw new Error(`Unknown block type: ${b.type}`);
  }
}

/**
 * Solid brand button. A table cell with a background colour rather than a
 * styled <a>, because Outlook drops padding and background on anchors.
 * 4px radius, not a pill — reads closer to a product email than a promo blast.
 */
function renderCta(cta) {
  if (!cta) return "";
  if (!cta.label || !cta.url) {
    throw new Error("cta requires both `label` and `url`");
  }
  return `
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:6px 0 30px;">
                  <tr>
                    <td style="background:${PALETTE.accent};border-radius:4px;">
                      <a href="${cta.url}" style="display:inline-block;padding:15px 34px;${BODY_FONT}font-size:16px;font-weight:600;letter-spacing:0.01em;line-height:1;color:${PALETTE.onAccent};text-decoration:none;">${cta.label}</a>
                    </td>
                  </tr>
                </table>`;
}

/**
 * Full-bleed hero image, sitting directly under the masthead.
 *
 * Must be an absolute https URL on a host that is already deployed — email
 * clients cannot load local files, and Gmail strips data: URIs. Explicit width
 * and height attributes are required so the layout does not collapse in the
 * (common) case where the recipient has images turned off.
 */
function renderImage(image) {
  if (!image) return "";
  if (!image.url || !image.alt) {
    throw new Error("image requires both `url` and `alt`");
  }
  if (!image.url.startsWith("https://")) {
    throw new Error(`image.url must be an absolute https URL, got: ${image.url}`);
  }
  const width = image.width ?? CONTENT_WIDTH;
  const height = image.height ? ` height="${image.height}"` : "";
  return `
            <tr>
              <td style="padding:0;font-size:0;line-height:0;">
                <img src="${image.url}" alt="${image.alt}" width="${width}"${height} border="0" style="display:block;width:100%;height:auto;border:0;outline:none;text-decoration:none;" />
              </td>
            </tr>
`;
}

/**
 * Render the full broadcast HTML document.
 *
 * @param {object} opts
 * @param {string} opts.heading            Lead heading (raw HTML allowed).
 * @param {Array<string|object>} opts.blocks  Body blocks, in order.
 * @param {{url: string, alt: string, width?: number, height?: number}} [opts.image]
 *        Hero image under the masthead. Absolute https URL, already deployed.
 * @param {{label: string, url: string}} [opts.cta]  Optional call-to-action button.
 * @param {string} [opts.previewText]      Inbox preview line. Strongly recommended.
 * @param {string} [opts.wordmark]         Masthead text. Defaults to the brand.
 * @param {string} [opts.signoff]          Defaults to the Campus Crush sign-off.
 * @param {string} [opts.footerNote]       Why the recipient is getting this.
 * @returns {string} Complete HTML document.
 */
export function renderBroadcast({
  heading,
  blocks = [],
  image,
  cta,
  previewText = "",
  wordmark = "campus crush",
  signoff = "See you soon,<br />— Campus Crush",
  footerNote = "You're receiving this because you signed up for Campus Crush.",
}) {
  if (!heading) throw new Error("renderBroadcast requires a `heading`");
  if (!Array.isArray(blocks) || blocks.length === 0) {
    throw new Error("renderBroadcast requires at least one block");
  }

  const body = blocks.map(renderBlock).join("\n                ");

  // Hidden preheader: what the inbox shows next to the subject. The trailing
  // zero-width spaces stop Gmail from pulling body copy in after it.
  const preheader = previewText
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${previewText}${"&#847;&zwnj;&nbsp;".repeat(60)}</div>`
    : "";

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Jersey+25&display=swap" rel="stylesheet" />
  </head>
  <body style="margin:0;padding:0;background:${PALETTE.surface};">
    ${preheader}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;background:${PALETTE.surface};">
      <tr>
        <td style="padding:0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;background:${PALETTE.surface};">

            <!-- masthead -->
            <tr>
              <td style="background:${PALETTE.accent};padding:20px 40px;">
                <span style="${HEADING_FONT}font-size:24px;line-height:1;color:${PALETTE.onAccent};text-transform:lowercase;">${wordmark}</span>
              </td>
            </tr>
${renderImage(image)}
            <!-- content -->
            <tr>
              <td style="padding:40px;${BODY_FONT}color:${PALETTE.body};">
                <h1 style="margin:0 0 22px;${HEADING_FONT}font-size:34px;line-height:1.15;color:${PALETTE.ink};">
                  ${heading}
                </h1>
                ${body}${renderCta(cta)}
                <div style="height:1px;line-height:1px;font-size:1px;background:${PALETTE.hairline};margin:0 0 22px;">&nbsp;</div>
                <p style="margin:0;font-size:15px;line-height:1.65;color:${PALETTE.muted};">
                  ${signoff}
                </p>
              </td>
            </tr>

            <!-- footer -->
            <tr>
              <td style="background:${PALETTE.card};padding:22px 40px;${BODY_FONT}font-size:12px;line-height:1.6;color:${PALETTE.faint};">
                ${footerNote}<br />
                <a href="${UNSUBSCRIBE_TOKEN}" style="color:${PALETTE.faint};text-decoration:underline;">Unsubscribe</a>
                &nbsp;&middot;&nbsp;
                <a href="https://campus-crush.org" style="color:${PALETTE.faint};text-decoration:underline;">campus-crush.org</a>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/**
 * Plain-text alternative. Sending a text part alongside the HTML measurably
 * helps deliverability — some spam filters penalise HTML-only mail.
 */
export function renderBroadcastText({
  heading,
  blocks = [],
  cta,
  signoff = "See you soon,\n— Campus Crush",
  footerNote = "You're receiving this because you signed up for Campus Crush.",
}) {
  const strip = (html) =>
    String(html)
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .trim();

  const lines = [strip(heading), ""];

  for (const block of blocks) {
    const b = normalizeBlock(block);
    if (b.type === "p") lines.push(strip(b.text), "");
    else if (b.type === "h2") lines.push(strip(b.text).toUpperCase(), "");
    else if (b.type === "callout") lines.push(strip(b.text), "");
    else if (b.type === "list") {
      for (const item of b.items ?? []) lines.push(`- ${strip(item)}`);
      lines.push("");
    } else if (b.type === "divider") lines.push("---", "");
  }

  if (cta) lines.push(`${strip(cta.label)}: ${cta.url}`, "");

  lines.push(strip(signoff), "", "-----", footerNote, `Unsubscribe: ${UNSUBSCRIBE_TOKEN}`);

  return lines.join("\n");
}

/**
 * Assert that rendered HTML actually carries the Campus Crush brand formatting.
 *
 * This exists because the failure it guards against is silent and unrecallable:
 * a broadcast built by hand, pasted from a doc, or assembled by some future
 * caller that skips renderBroadcast() would send as unstyled HTML to the whole
 * list, and nobody notices until it is in 190 inboxes. `draft` runs this before
 * anything reaches Resend.
 *
 * @param {string} html
 * @returns {string[]} Human-readable problems. Empty means the email is on-brand.
 */
export function checkBrandFormatting(html) {
  const problems = [];
  const require = (condition, message) => {
    if (!condition) problems.push(message);
  };

  require(html.includes("<!DOCTYPE html>"), "no DOCTYPE — clients will quirks-mode this");
  require(
    html.includes(`background:${PALETTE.accent};padding:20px 40px`),
    "missing the terracotta masthead band"
  );
  require(html.includes(HEADING_FONT), "missing the Jersey 25 display font stack");
  require(html.includes(BODY_FONT), "missing the body font stack");
  require(html.includes(PALETTE.surface), "missing the brand surface colour");
  require(
    html.includes(`background:${PALETTE.card};padding:22px 40px`),
    "missing the cream footer band"
  );
  require(html.includes(UNSUBSCRIBE_TOKEN), "missing the unsubscribe link");
  require(
    /<table[^>]+role="presentation"/.test(html),
    "not table-based — will collapse in Outlook"
  );
  require(!/<div[^>]+display:\s*flex/i.test(html), "uses flexbox, which email clients strip");
  require(!/<link[^>]+stylesheet[^>]*>[\s\S]*<body/.test(html) || html.includes("style=\""),
    "relies on an external stylesheet instead of inline styles");

  return problems;
}

export { PALETTE, CONTENT_WIDTH, HEADING_FONT, BODY_FONT };
