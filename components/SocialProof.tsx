"use client";
import Image from "next/image";

const darkOverlay = "rgba(18,16,14,0.62)";

export default function SocialProof() {
  return (
    <section className="relative">
      {/* ── Stats ── beachdate.jpeg */}
      <div className="relative flex items-center justify-center overflow-hidden" style={{ minHeight: "420px" }}>
        <Image src="/beachdate.jpeg" alt="" fill className="object-cover" aria-hidden="true" />
        <div className="absolute inset-0" style={{ background: darkOverlay }} aria-hidden="true" />

        <div className="relative flex flex-col items-center gap-5 px-6 py-16 text-center" style={{ zIndex: 1 }}>
          <p className="font-jersey text-xs tracking-[0.3em] uppercase text-white/50">
            Real campus connections made
          </p>

          <div
            className="flex flex-col items-center px-6 py-3 rounded-full"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)" }}
          >
            <span className="font-jersey text-4xl tracking-wider text-white">5,000+</span>
            <span className="font-jersey text-xs tracking-widest uppercase text-white/55">campus matches this term</span>
          </div>

          <div className="flex gap-4">
            {[{ n: "88%", l: "hang out again" }, { n: "94%", l: "beats dating apps" }].map(({ n, l }) => (
              <div
                key={n}
                className="flex flex-col items-center px-5 py-3 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)" }}
              >
                <span className="font-jersey text-3xl tracking-wide text-white">{n}</span>
                <span className="font-jersey text-xs tracking-widest uppercase text-white/55">{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── AI Matchmaker ── noodle-date.jpeg */}
      <div className="relative overflow-hidden" aria-labelledby="matchmaker-heading">
        <Image src="/noodle-date.jpeg" alt="" fill className="object-cover" aria-hidden="true" />
        <div className="absolute inset-0" style={{ background: darkOverlay }} aria-hidden="true" />

        <div className="relative max-w-lg mx-auto px-6 py-20 text-center" style={{ zIndex: 1 }}>
          <h2
            id="matchmaker-heading"
            className="font-jersey text-[clamp(2rem,8vw,4rem)] leading-none tracking-widest mb-3 text-white"
          >
            Your Campus Matchmaker
          </h2>
          <p className="text-sm mb-12 text-white/60">
            Not another swipe app — a smarter way to meet people who are literally right there
          </p>

          <ul className="flex flex-col gap-4 list-none text-left" aria-label="Campus Crush features">
            {[
              { icon: "🎓", title: "Matches only at your school", desc: "Every match is a verified student on your campus — no catfishes, no strangers" },
              { icon: "🧠", title: "Learns what you actually like", desc: "Gets smarter every hangout — the more you meet, the better the matches" },
              { icon: "📍", title: "Picks the perfect campus spot", desc: "Library café, quad picnic, or campus gym — we pick the right vibe for both of you" },
            ].map((feat) => (
              <li
                key={feat.title}
                className="flex items-start gap-4 p-4 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)" }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                  aria-hidden="true"
                >
                  {feat.icon}
                </div>
                <div>
                  <p className="font-jersey tracking-widest mb-1 text-white">{feat.title}</p>
                  <p className="text-xs leading-relaxed text-white/60">{feat.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
