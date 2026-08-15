# Pilot confirmation email

Sent to a student the moment their $5 payment is confirmed for the semester 2,
2026 pilot.

**Implementation:** `lib/emails/pilot-confirmation.ts`
**Layout:** `lib/emails/template.ts`
**Triggered from:** `app/pilot/success/page.tsx`, guarded by
`pilot_signups.confirmation_email_sent_at` so it can only send once.

## Format

Uses the **broadcast layout**, not the old transactional card:

- Full-width terracotta masthead with the `campus crush` wordmark
- 600px content column, squared edges, warm off-white surface
- Terracotta uppercase subheadings, each with a short rule beneath
- Bulleted lists with terracotta bullets
- Cream callout panel with a terracotta left border for the one thing that must
  be read
- Cream footer band

This deliberately matches the mass email that announced the pilot opening. A
student who received that broadcast and then pays should see the same brand,
not a different template.

`lib/emails/template.ts` is a TypeScript port of
`.claude/skills/campus-crush-broadcast/scripts/template.mjs`. **Keep the two in
sync** — if the palette or masthead changes in one, change it in the other.

The one intentional difference: the broadcast template hardcodes Resend's
`{{{RESEND_UNSUBSCRIBE_URL}}}` token, which only interpolates on broadcast
sends. Transactional mail omits it, because it would otherwise render as
literal text in the footer.

**Superseded:** the rounded floating-card layout used by the waitlist welcome
email in `app/api/waitlist/route.ts`. That email has not been migrated yet.

## Copy

**Subject:** You're in! Campus Crush semester 2 pilot 💘
**Preview text:** Your spot in the semester 2, 2026 pilot is confirmed.
**Heading:** You're in, {first name}!

---

You've successfully joined the **semester 2, 2026 pilot program** — thanks for
being one of the first!

### What is the pilot?

During the pilot, 100 students will receive a campus crush match. Students will
be matched based on dating intentions, values and hobbies as well as preferences
such as age, height and ethnicity. All sexualities and gender identities are
welcome!

If you both accept the date, you will be matched at one of our partnered venues
where you'll receive discounts and freebies:

- Flovie Florist Cafe
- Prince Alfred Carlton
- Another mystery venue

After the date, students will receive a short form about their experience with
the website, and how the date went.

> **Callout panel:** Please note that due to the small number, we cannot
> guarantee that everyone will receive a perfect match — please approach this
> with an open mind to meet new people! However, if no successful matching
> happens, you will receive a **full refund**.

### What's next

- You'll receive a text and email when we launch
- Enjoy your date!

---

**Sign-off:** See you soon, — Alex & Joyce, Campus Crush
**Footer:** You're receiving this because you joined the Campus Crush semester
2, 2026 pilot.

## Open items

- Third venue is still "another mystery venue" — replace once confirmed
- The refund promise here is a commitment; see the design doc's risk note on
  whether Square returns its processing fee on a refund
