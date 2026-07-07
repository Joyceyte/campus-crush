export interface BlogPost {
  slug: string;
  title: string;
  /** ISO date string, e.g. "2026-07-07" */
  date: string;
  excerpt: string;
  /**
   * Body content in a small markdown-ish subset: paragraphs separated by
   * blank lines, "## " headings, "- " bullet lists, "**bold**", "[text](url)"
   * links, and "<email@address>" autolinks. Rendered by the post page.
   */
  content: string;
}

const SAFETY_CONTENT = `
We built Campus Crush so you'd meet great people, and we want every date to feel safe. Here's the stuff we'd tell our own friends before a first date, plus every UniMelb safety resource worth having in your phone.

**TLDR:**

- Emergency, anywhere: **000**
- Free 24/7 security escort on campus: **03 8344 6666** or **1800 246 066**, or the SafeZone app
- Emergency blue phones, locations mapped for [Parkville](https://maps.unimelb.edu.au/parkville/emergency-telephones) and [Southbank](https://maps.unimelb.edu.au/southbank/emergency-telephones)
- Report an incident: [Speak Safely portal](https://uom.elker.com/report) or <support@campus-crush.org>

## Before you meet

**Tell a friend.** Who, where, when. Send them your match's profile and agree on a check-in time.

**Share your live location** with someone you trust (Find My, Google Maps, whatever you use). Thirty seconds, and someone always knows where you are.

**Meet during the day, somewhere busy.** Your date card will point you somewhere public. If you're making your own plans after, keep the same energy.

**Get yourself there and back.** Don't rely on your date for transport the first time you meet.

**Verified student ≠ character reference.** Email verification tells you they go here. That's all it tells you. Treat this like any first date with someone new.

## During the date

**Stay in public** for the first date. Second one too, honestly. Anyone who pressures you somewhere private is showing you a red flag, not paying you a compliment.

**Watch your drink.** Keep it with you, and skip anything you didn't see made.

**You can leave whenever.** "I've got to head off" is a full sentence. A good match respects it. Anyone who doesn't has just told you everything.

**Feel unsafe? You have options right where you're standing:**

- **University Security: 03 8344 6666** (or **1800 246 066** free call). On campus 24/7.
- **Blue emergency help phones** across Parkville and Southbank. Press the button and you're straight through to the security control room, with nearby CCTV activated.
- **SafeZone app** (free, App Store and Google Play). One tap shares your location with Security and gets help moving toward you. It also has a check-in timer: set it before a solo walk, and if you don't cancel it, Security gets alerted automatically.
- Life-threatening situation: **000** first, then Security.

## If something goes wrong

Nothing that happens on a date is ever your fault, and you don't have to handle it alone.

**Safer Community Program.** The University's confidential place to report and get advice about anything inappropriate, concerning or threatening, including sexual harassment and assault, and stalking.

- **03 9035 8675** (Mon–Fri, 9am–5pm)
- [**safer-community@unimelb.edu.au**](mailto:safer-community@unimelb.edu.au)
- safercommunity.unimelb.edu.au

**Speak Safely portal.** Disclose sexual assault, harassment or other inappropriate behaviour online, anonymously if you prefer, and decide what happens next: **uom.elker.com/report**

**Tell us too.** Report any Campus Crush user in the app or at <support@campus-crush.org>. We take every report seriously, we act on them, and we keep them confidential.

## Looking after yourself

Dating stirs things up sometimes. If you need someone to talk to:

- **CAPS** — free, confidential counselling for enrolled students: **03 8344 6927**, Mon–Fri 9am–4:45pm, Level 5, 757 Swanston St
- **University Mental Health Crisis Support**, 24/7: call **1300 219 459** or text **0480 079 188**
- **Lifeline**, 24/7: **13 11 14**
- **1800RESPECT** (domestic, family or sexual violence), 24/7: **1800 737 732**
- **13YARN** (crisis support run by Aboriginal and Torres Strait Islander people), 24/7: **13 92 76**
- **Rainbow Door** (LGBTIQA+ support): **1800 729 367**

Have fun out there. Text your friend when you're home.
`;

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "safety",
    title: "Meeting Your Match Safely",
    date: "2026-07-07",
    excerpt:
      "Everything we'd tell our own friends before a first date, plus every UniMelb safety resource worth having in your phone.",
    content: SAFETY_CONTENT,
  },
];

export function getAllPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export function formatPostDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-AU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
