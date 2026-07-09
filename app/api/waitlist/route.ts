import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { resend, WELCOME_FROM } from "@/lib/resend";

export const dynamic = "force-dynamic";

const GENDERS = ["male", "female", "non-binary", "other"];

// Accepted student email domains, mapped to the university they verify.
// Checked longest-suffix-first isn't needed since none of these overlap.
const UNI_DOMAINS = [
  { suffix: "@student.unimelb.edu.au", university: "University of Melbourne" },
  { suffix: "@student.monash.edu", university: "Monash University" },
  { suffix: "@deakin.edu.au", university: "Deakin University" },
  { suffix: "@student.rmit.edu.au", university: "RMIT University" },
];

export async function POST(req: NextRequest) {
  const { name, email, gender } = await req.json();

  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
  }

  if (!GENDERS.includes(gender)) {
    return NextResponse.json({ error: "Please select a gender." }, { status: 400 });
  }

  const cleanEmail = email.trim().toLowerCase();
  const matchedUni = UNI_DOMAINS.find((d) => cleanEmail.endsWith(d.suffix));

  if (!matchedUni) {
    return NextResponse.json(
      {
        error:
          "Must be a University of Melbourne, Monash, Deakin, or RMIT student email. We're working hard to expand to more unis — please be patient with us!",
      },
      { status: 400 }
    );
  }

  const cleanName = name.trim();

  const { error } = await supabase
    .from("waitlist")
    .insert({ name: cleanName, email: cleanEmail, gender, university: matchedUni.university });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "You're already on the list!" }, { status: 409 });
    }
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }

  await sendWelcomeEmail(cleanName, cleanEmail);

  return NextResponse.json({ ok: true });
}

// Sends the welcome email. Never throws — a mail failure must not fail the
// signup, since the user is already on the waitlist at this point.
async function sendWelcomeEmail(name: string, email: string) {
  try {
    const { error } = await resend.emails.send({
      from: WELCOME_FROM,
      to: email,
      subject: "Welcome to Campus Crush ! 💘",
      html: welcomeHtml(name, email),
      headers: {
        // Lets Gmail/Apple Mail show a native unsubscribe button.
        "List-Unsubscribe": `<${unsubscribeMailto(email)}>`,
      },
    });

    if (error) {
      console.error("Resend welcome email failed:", error);
    }
  } catch (err) {
    console.error("Resend welcome email threw:", err);
  }
}

// Unsubscribe address. Opting out emails hello@ with the recipient prefilled,
// so you know who to remove from the waitlist.
function unsubscribeMailto(email: string) {
  const subject = encodeURIComponent("Unsubscribe from Campus Crush");
  const body = encodeURIComponent(`Please remove ${email} from the waitlist.`);
  return `mailto:hello@campus-crush.org?subject=${subject}&body=${body}`;
}

// Welcome email sent to every new waitlist signup. Matches the site theme:
// parchment background, terracotta accents, and the Jersey 25 display font for
// the heading (loads in Apple/iOS Mail; falls back cleanly elsewhere).
// Inline styles + tables for broad email-client support. ${name} personalizes.
function welcomeHtml(name: string, email: string) {
  const heading = "font-family:'Jersey 25','Arial Narrow',Arial,sans-serif;letter-spacing:0.06em;";
  const body = "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;";
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <meta name="color-scheme" content="light" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Jersey+25&display=swap" rel="stylesheet" />
    </head>
    <body style="margin:0;padding:0;background:#F7EFE1;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7EFE1;padding:32px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#EFE3CD;border-radius:24px;overflow:hidden;border:1px solid rgba(43,27,18,0.14);box-shadow:0 25px 60px rgba(43,27,18,0.25);">
              <tr>
                <td style="background:#C1512F;height:6px;line-height:6px;font-size:6px;">&nbsp;</td>
              </tr>
              <tr>
                <td style="padding:40px 32px;${body}color:rgba(43,27,18,0.75);">
                  <h1 style="margin:0 0 24px;${heading}font-size:30px;line-height:1.2;color:#2B1B12;">
                    Welcome to campus&nbsp;crush, ${name}! <span style="color:#C1512F;">💘</span>
                  </h1>
                  <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:rgba(43,27,18,0.75);">
                    I'm the friend that texts you ready-to-go dates.
                  </p>
                  <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:rgba(43,27,18,0.75);">
                    Congrats on being one of the <strong style="color:#2B1B12;">first 100 users</strong> to sign up! You'll automatically get
                    <strong style="color:#C1512F;">one month of free premium membership</strong> on our invite-only app.
                  </p>
                  <p style="margin:0 0 28px;font-size:16px;line-height:1.6;color:rgba(43,27,18,0.75);">
                    We won't spam you with details. You'll only hear from us when the app launches
                    <strong style="color:#2B1B12;">this winter</strong>, just in time for your perfect winter break date ;).
                  </p>
                  <p style="margin:0;font-size:16px;line-height:1.6;color:rgba(43,27,18,0.55);">
                    See you soon,<br />— Campus Crush
                  </p>
                </td>
              </tr>
            </table>
            <p style="max-width:480px;margin:16px auto 0;${body}font-size:12px;line-height:1.5;color:rgba(43,27,18,0.5);text-align:center;">
              You're receiving this because you joined the Campus Crush waitlist.<br />
              <a href="${unsubscribeMailto(email)}" style="color:rgba(43,27,18,0.5);text-decoration:underline;">Unsubscribe</a>
            </p>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
}

export async function GET() {
  const { data: count, error } = await supabase.rpc("waitlist_count");
  if (error) console.error("waitlist_count RPC failed:", error);

  return NextResponse.json({ count: count ?? 0 });
}
