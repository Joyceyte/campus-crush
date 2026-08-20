import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { resend, WELCOME_FROM } from "@/lib/resend";
import { normalisePhone, GENDERS, SEXUALITIES, HEARD_FROM_OPTIONS, isValidAge } from "@/lib/pilot";
import { addToWaitlistSegment } from "@/lib/resend-segment";

export const dynamic = "force-dynamic";

// The first 80 real signups are founding members — with the +20 momentum
// padding shown on the site, they fill the displayed 100-spot goal. Anyone
// who joins after the countdown hits 0 doesn't get the tag.
const FOUNDING_MEMBER_CAP = 80;

// Accepted student email domains, mapped to the university they verify.
// Checked longest-suffix-first isn't needed since none of these overlap.
const UNI_DOMAINS = [
  { suffix: "@student.unimelb.edu.au", university: "University of Melbourne" },
  { suffix: "@student.monash.edu", university: "Monash University" },
  { suffix: "@deakin.edu.au", university: "Deakin University" },
  { suffix: "@student.rmit.edu.au", university: "RMIT University" },
  { suffix: "@students.latrobe.edu.au", university: "La Trobe University" },
];

export async function POST(req: NextRequest) {
  const { name, email, gender, age, sexuality, phone: phoneRaw, heardFrom } = await req.json();

  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
  }

  if (!GENDERS.includes(gender)) {
    return NextResponse.json({ error: "Please select a gender." }, { status: 400 });
  }

  const ageNum = Number(age);
  if (!isValidAge(ageNum)) {
    return NextResponse.json({ error: "Please enter a valid age (18 or over)." }, { status: 400 });
  }

  if (!SEXUALITIES.includes(sexuality)) {
    return NextResponse.json({ error: "Please select an option for sexuality." }, { status: 400 });
  }

  if (!HEARD_FROM_OPTIONS.includes(heardFrom)) {
    return NextResponse.json(
      { error: "Please let us know how you heard about us." },
      { status: 400 }
    );
  }

  const phone = normalisePhone(String(phoneRaw ?? ""));
  if (!phone) {
    return NextResponse.json(
      { error: "Please enter a valid Australian mobile number, e.g. 0412 345 678." },
      { status: 400 }
    );
  }

  const cleanEmail = email.trim().toLowerCase();
  const matchedUni = UNI_DOMAINS.find((d) => cleanEmail.endsWith(d.suffix));

  if (!matchedUni) {
    return NextResponse.json(
      {
        error:
          "Must be a University of Melbourne, Monash, Deakin, RMIT, or La Trobe student email. We're working hard to expand to more unis — please be patient with us!",
      },
      { status: 400 }
    );
  }

  const cleanName = name.trim();

  // Never over-grant: if the count lookup fails, the signup goes through
  // without the founding-member tag rather than blocking the join.
  const { data: currentCount, error: countError } = await supabase.rpc("waitlist_count");
  if (countError) console.error("waitlist_count RPC failed:", countError);
  const foundingMember = typeof currentCount === "number" && currentCount < FOUNDING_MEMBER_CAP;

  const { error } = await supabase.from("waitlist").insert({
    name: cleanName,
    email: cleanEmail,
    phone,
    gender,
    age: ageNum,
    sexuality,
    heard_from: heardFrom,
    university: matchedUni.university,
    founding_member: foundingMember,
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "You're already on the list!" }, { status: 409 });
    }
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }

  await sendWelcomeEmail(cleanName, cleanEmail);
  await addToWaitlistSegment(cleanEmail, cleanName.split(/\s+/)[0]);

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
// parchment background, terracotta accents. No Google Fonts <link> here on
// purpose — it only ever rendered in Apple/iOS Mail, and the external fetch
// was holding up render in Gmail. The Arial Narrow fallback is what nearly
// everyone already saw.
// Inline styles + tables for broad email-client support. ${name} personalizes.
function welcomeHtml(name: string, email: string) {
  const heading = "font-family:'Arial Narrow',Arial,sans-serif;letter-spacing:0.06em;";
  const body = "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;";
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <meta name="color-scheme" content="light" />
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
                    You're on the list. We'll let you know the moment Campus Crush opens up at your uni.
                  </p>
                  <p style="margin:0 0 28px;font-size:16px;line-height:1.6;color:rgba(43,27,18,0.75);">
                    Right now we're running a <strong style="color:#2B1B12;">semester 2, 2026 pilot at UniMelb</strong> with
                    our venues. If you're at UniMelb, you can
                    <a href="https://campus-crush.org" style="color:#C1512F;">join the pilot</a> before
                    <strong style="color:#2B1B12;">signups close</strong>. If you're not, sit tight. You'll be first
                    to hear when we expand.
                  </p>
                  <p style="margin:0 0 28px;font-size:16px;line-height:1.6;color:rgba(43,27,18,0.75);">
                    We won't spam you. You'll only hear from us when there's something real to share.
                  </p>
                  <p style="margin:0 0 28px;font-size:16px;line-height:1.6;color:rgba(43,27,18,0.75);">
                    While you wait, follow us on <a href="https://www.instagram.com/campuscrush_uni/" style="color:#C1512F;">Instagram</a> and <a href="https://www.tiktok.com/@campus_crush.org" style="color:#C1512F;">TikTok</a> for behind-the-scenes and more info.
                  </p>
                  <p style="margin:0;font-size:16px;line-height:1.6;color:rgba(43,27,18,0.55);">
                    See you soon,<br />Campus Crush
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
