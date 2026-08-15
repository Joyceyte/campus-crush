/**
 * Campus Crush email layout — the shared brand shell for anything we send.
 *
 * This is a TypeScript port of the broadcast template in
 * `.claude/skills/campus-crush-broadcast/scripts/template.mjs`, so that
 * transactional mail sent from the app looks identical to the mass emails sent
 * through Resend broadcasts. Keep the two in sync: if the palette or the
 * masthead changes in one, change it in the other.
 *
 * Layout: full-width terracotta masthead over a 600px content column with
 * squared edges — an editorial/newsletter structure, not the floating rounded
 * card the old waitlist welcome email uses.
 *
 * Table-based with inline styles throughout, which is the only layout that
 * survives Outlook and Gmail's CSS stripping.
 *
 * TRUST MODEL: `heading`, block content and `cta.label` are emitted as raw HTML
 * so copy can use <strong>, <em>, <a> and &nbsp;. That copy is written by us,
 * not by users. Anything coming from the database or an API must be passed
 * through `esc()` first.
 */

export const PALETTE = {
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
} as const;

export const CONTENT_WIDTH = 600;

export const HEADING_FONT =
  "font-family:'Jersey 25','Arial Narrow',Arial,sans-serif;letter-spacing:0.06em;";
export const BODY_FONT =
  "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;";

export type Block =
  | string
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "list"; items: string[] }
  | { type: "callout"; text: string }
  | { type: "divider" };

/** Escape a dynamic value before putting it inside a block. */
export function esc(value: unknown): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderBlock(block: Block): string {
  const b = typeof block === "string" ? ({ type: "p", text: block } as const) : block;

  switch (b.type) {
    case "p":
      return `<p style="margin:0 0 18px;font-size:16px;line-height:1.65;color:${PALETTE.body};">${b.text}</p>`;

    // Subheading: terracotta, with a short rule beneath it so sections read as
    // sections even when Jersey 25 falls back to Arial Narrow.
    case "h2":
      return `<h2 style="margin:34px 0 6px;${HEADING_FONT}font-size:21px;line-height:1.3;color:${PALETTE.accent};text-transform:uppercase;">${b.text}</h2>
                <div style="width:44px;height:3px;line-height:3px;font-size:3px;background:${PALETTE.accent};margin:0 0 16px;">&nbsp;</div>`;

    case "list": {
      const items = b.items
        .map(
          (item) =>
            // The bullet cell needs an explicit width. Without one, auto table
            // layout hands it a share of the full width and the bullet ends up
            // marooned far from its text.
            `<tr>
                    <td valign="top" width="16" style="width:16px;padding:0 8px 10px 0;${BODY_FONT}font-size:16px;line-height:1.65;color:${PALETTE.accent};font-weight:700;">&bull;</td>
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
  }
}

/**
 * Solid brand button. A table cell with a background colour rather than a
 * styled <a>, because Outlook drops padding and background on anchors.
 */
function renderCta(cta?: { label: string; url: string }): string {
  if (!cta) return "";
  return `
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:6px 0 30px;">
                  <tr>
                    <td style="background:${PALETTE.accent};border-radius:4px;">
                      <a href="${cta.url}" style="display:inline-block;padding:15px 34px;${BODY_FONT}font-size:16px;font-weight:600;letter-spacing:0.01em;line-height:1;color:${PALETTE.onAccent};text-decoration:none;">${cta.label}</a>
                    </td>
                  </tr>
                </table>`;
}

export function renderEmail({
  heading,
  blocks,
  cta,
  previewText = "",
  wordmark = "campus crush",
  signoff = "See you soon,<br />— Campus Crush",
  footerNote = "You're receiving this because you signed up for Campus Crush.",
  unsubscribeUrl,
}: {
  heading: string;
  blocks: Block[];
  cta?: { label: string; url: string };
  previewText?: string;
  wordmark?: string;
  signoff?: string;
  footerNote?: string;
  /**
   * Omit for transactional mail. The broadcast template hardcodes Resend's
   * `{{{RESEND_UNSUBSCRIBE_URL}}}` token, which only interpolates on broadcast
   * sends — in a transactional email it would render as literal text.
   */
  unsubscribeUrl?: string;
}): string {
  if (!heading) throw new Error("renderEmail requires a `heading`");
  if (!blocks.length) throw new Error("renderEmail requires at least one block");

  const body = blocks.map(renderBlock).join("\n                ");

  // Hidden preheader: what the inbox shows next to the subject. The trailing
  // zero-width spaces stop Gmail pulling body copy in after it.
  const preheader = previewText
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${previewText}${"&#847;&zwnj;&nbsp;".repeat(60)}</div>`
    : "";

  const unsubscribe = unsubscribeUrl
    ? `<a href="${unsubscribeUrl}" style="color:${PALETTE.faint};text-decoration:underline;">Unsubscribe</a>
                &nbsp;&middot;&nbsp;`
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
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;background:${PALETTE.page};">
      <tr>
        <td align="center" style="padding:0;">
          <!-- Content column. Both the width attribute and the max-width style
               are needed: Outlook honours the attribute and ignores the style,
               everything else does the reverse. Without them the email renders
               edge-to-edge on a wide desktop client. -->
          <table role="presentation" width="${CONTENT_WIDTH}" cellpadding="0" cellspacing="0" align="center" style="width:100%;max-width:${CONTENT_WIDTH}px;background:${PALETTE.surface};">

            <!-- masthead -->
            <tr>
              <td style="background:${PALETTE.accent};padding:20px 40px;">
                <span style="${HEADING_FONT}font-size:24px;line-height:1;color:${PALETTE.onAccent};text-transform:lowercase;">${wordmark}</span>
              </td>
            </tr>

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
                ${unsubscribe}<a href="https://campus-crush.org" style="color:${PALETTE.faint};text-decoration:underline;">campus-crush.org</a>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/** Plain-text alternative. Sending one alongside the HTML helps deliverability. */
export function renderEmailText({
  heading,
  blocks,
  cta,
  signoff = "See you soon,\n— Campus Crush",
  footerNote = "You're receiving this because you signed up for Campus Crush.",
}: {
  heading: string;
  blocks: Block[];
  cta?: { label: string; url: string };
  signoff?: string;
  footerNote?: string;
}): string {
  const strip = (html: string) =>
    String(html)
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&rsquo;/g, "'")
      .trim();

  const lines: string[] = [strip(heading), ""];

  for (const block of blocks) {
    const b = typeof block === "string" ? ({ type: "p", text: block } as const) : block;
    if (b.type === "p") lines.push(strip(b.text), "");
    else if (b.type === "h2") lines.push(strip(b.text).toUpperCase(), "");
    else if (b.type === "callout") lines.push(strip(b.text), "");
    else if (b.type === "list") {
      for (const item of b.items) lines.push(`- ${strip(item)}`);
      lines.push("");
    } else if (b.type === "divider") lines.push("---", "");
  }

  if (cta) lines.push(`${strip(cta.label)}: ${cta.url}`, "");
  lines.push(strip(signoff), "", "-----", footerNote);

  return lines.join("\n");
}
