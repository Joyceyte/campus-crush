import { resend, WELCOME_FROM } from "@/lib/resend";
import { renderEmail, renderEmailText, esc, PALETTE, type Block } from "@/lib/emails/template";

// Confirmation email for a paid pilot signup.
//
// Uses the shared broadcast layout (terracotta masthead, 600px editorial
// column) so it matches the mass email that announced the pilot — a student
// who got that one and then pays should see the same brand, not a different
// template. Copy is from specs/pilot-confirmation-email.md.

const SIGNOFF = "See you soon,<br />Alex &amp; Joyce, Campus Crush";
const SIGNOFF_TEXT = "See you soon,\nAlex & Joyce, Campus Crush";
const FOOTER_NOTE =
  "You're receiving this because you joined the Campus Crush semester 2, 2026 pilot.";

function blocks(): Block[] {
  return [
    "You&rsquo;ve successfully joined the <strong>semester 2, 2026 pilot program</strong>. Thanks for being one of the first!",

    { type: "h2", text: "What is the pilot?" },
    "During the pilot, students will receive a campus crush match. Students will be matched based on dating intentions, values and hobbies as well as preferences such as age, height and ethnicity. All sexualities and gender identities are welcome!",
    "If you both accept the date, you will be matched at one of our partnered venues where you&rsquo;ll receive discounts and freebies:",
    {
      type: "list",
      items: ["Flovie Florist Cafe", "Prince Alfred Carlton", "Another mystery venue"],
    },
    "After the date, students will receive a short form about their experience with the website, and how the date went.",

    {
      type: "callout",
      text: "Please note that due to limited pilot numbers, we cannot guarantee that everyone will receive a perfect match. Please approach this with an open mind to meet new people! If you are not matched for a date, you will receive a <strong>full refund</strong>.",
    },

    { type: "h2", text: "What&rsquo;s next" },
    {
      type: "list",
      items: [
        "You&rsquo;ll receive a text and email when we launch",
        "Enjoy your date!",
      ],
    },
    `While you wait, follow us on <a href="https://www.instagram.com/campuscrush_uni/" style="color:${PALETTE.accent};">Instagram</a> and <a href="https://www.tiktok.com/@campus_crush.org" style="color:${PALETTE.accent};">TikTok</a> for behind-the-scenes and more info.`,
  ];
}

/**
 * Never throws. A student who has paid is already recorded as paid — a mail
 * failure must not fail the page render or cost anyone their spot.
 */
export async function sendPilotConfirmationEmail(name: string, email: string) {
  const first = name.trim().split(/\s+/)[0] || "there";
  const heading = `You&rsquo;re in, ${esc(first)}!`;
  const body = blocks();

  try {
    const { error } = await resend.emails.send({
      from: WELCOME_FROM,
      to: email,
      subject: "You're in! Campus Crush semester 2 pilot 💘",
      html: renderEmail({
        heading,
        blocks: body,
        previewText: "Your spot in the semester 2, 2026 pilot is confirmed.",
        signoff: SIGNOFF,
        footerNote: FOOTER_NOTE,
      }),
      text: renderEmailText({
        heading,
        blocks: body,
        signoff: SIGNOFF_TEXT,
        footerNote: FOOTER_NOTE,
      }),
    });
    if (error) console.error("Pilot confirmation email failed:", error);
  } catch (err) {
    console.error("Pilot confirmation email threw:", err);
  }
}
