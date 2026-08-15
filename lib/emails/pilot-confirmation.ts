import { resend, WELCOME_FROM } from "@/lib/resend";

// Confirmation email for a paid pilot signup. Copy from specs/Home_page.md.
// Styled to match the waitlist welcome email: parchment ground, terracotta
// accents, Jersey 25 heading, inline styles + tables for email-client support.

const HEADING =
  "font-family:'Jersey 25','Arial Narrow',Arial,sans-serif;letter-spacing:0.06em;";
const BODY =
  "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;";

/**
 * Never throws. A student who has paid is already recorded as paid — a mail
 * failure must not turn into a failed page render or a lost spot.
 */
export async function sendPilotConfirmationEmail(name: string, email: string) {
  try {
    const { error } = await resend.emails.send({
      from: WELCOME_FROM,
      to: email,
      subject: "You're in! Campus Crush semester 2 pilot 💘",
      html: pilotConfirmationHtml(name),
    });
    if (error) console.error("Pilot confirmation email failed:", error);
  } catch (err) {
    console.error("Pilot confirmation email threw:", err);
  }
}

function pilotConfirmationHtml(name: string) {
  const first = name.trim().split(/\s+/)[0] || "there";
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
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#EFE3CD;border-radius:24px;overflow:hidden;border:1px solid rgba(43,27,18,0.14);box-shadow:0 25px 60px rgba(43,27,18,0.25);">
              <tr>
                <td style="background:#C1512F;height:6px;line-height:6px;font-size:6px;">&nbsp;</td>
              </tr>
              <tr>
                <td style="padding:40px 32px;${BODY}color:rgba(43,27,18,0.75);">
                  <h1 style="margin:0 0 20px;${HEADING}font-size:34px;line-height:1.15;color:#2B1B12;">
                    You&rsquo;re in, ${first}! <span style="color:#C1512F;">💘</span>
                  </h1>

                  <p style="margin:0 0 24px;font-size:16px;line-height:1.6;">
                    You&rsquo;ve successfully joined the <strong style="color:#2B1B12;">semester 2, 2026 pilot program</strong> — thanks for being one of the first!
                  </p>

                  <h2 style="margin:0 0 12px;${HEADING}font-size:22px;color:#2B1B12;">What is the Pilot?</h2>
                  <p style="margin:0 0 16px;font-size:15px;line-height:1.65;">
                    During the pilot, 100 students will receive a campus crush match. Students will be matched based on dating intentions, values and hobbies as well as preferences such as age, height and ethnicity. All sexualities and gender identities are welcome!
                  </p>
                  <p style="margin:0 0 10px;font-size:15px;line-height:1.65;">
                    If you both accept the date, you will be matched at one of our partnered venues where you&rsquo;ll receive discounts and freebies:
                  </p>
                  <ul style="margin:0 0 20px;padding-left:20px;font-size:15px;line-height:1.8;">
                    <li>Flovie Florist Cafe</li>
                    <li>Prince Alfred Carlton</li>
                    <li>Another mystery venue</li>
                  </ul>
                  <p style="margin:0 0 20px;font-size:15px;line-height:1.65;">
                    After the date, students will receive a short form about their experience with the website, and how the date went.
                  </p>

                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;background:rgba(193,81,47,0.09);border-left:3px solid #C1512F;border-radius:6px;">
                    <tr>
                      <td style="padding:14px 16px;font-size:14px;line-height:1.6;color:rgba(43,27,18,0.8);">
                        Please note that due to the small number, we cannot guarantee that everyone will receive a perfect match — please approach this with an open mind to meet new people!
                        <br /><br />
                        However, if no successful matching happens, you will receive a <strong style="color:#2B1B12;">full refund</strong>.
                      </td>
                    </tr>
                  </table>

                  <h2 style="margin:0 0 10px;${HEADING}font-size:22px;color:#2B1B12;">What&rsquo;s next</h2>
                  <p style="margin:0 0 24px;font-size:15px;line-height:1.65;">
                    We haven&rsquo;t launched yet, but you&rsquo;ll be the first to know — you&rsquo;ll receive a text and email when we do. Enjoy your date!
                  </p>

                  <p style="margin:0;font-size:15px;line-height:1.6;color:rgba(43,27,18,0.55);">
                    See you soon,<br />— Alex &amp; Joyce, Campus Crush
                  </p>
                </td>
              </tr>
            </table>
            <p style="max-width:520px;margin:16px auto 0;${BODY}font-size:12px;line-height:1.5;color:rgba(43,27,18,0.5);text-align:center;">
              You&rsquo;re receiving this because you joined the Campus Crush semester 2, 2026 pilot.
            </p>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
}
