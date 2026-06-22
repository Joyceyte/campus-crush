"use client";
import Image from "next/image";
import { useRef, useState } from "react";

const testimonials = [
  {
    name: "Maya C.",
    detail: "UCLA · Junior",
    text: "I walked past this guy in the library every week. Campus Crush matched us for a study session. We've been dating for 3 months now 🥹",
    initial: "M",
  },
  {
    name: "Tyler R.",
    detail: "NYU · Senior",
    text: "Every dating app felt off. Campus Crush matched me with someone in my major. First hangout was a campus coffee chat. Zero awkwardness.",
    initial: "T",
  },
  {
    name: "Priya N.",
    detail: "UT Austin · Sophomore",
    text: "The AI picked a quad picnic. I showed up thinking it'd be weird — it was genuinely the best afternoon I've had this semester.",
    initial: "P",
  },
  {
    name: "Jordan K.",
    detail: "UMich · Junior",
    text: "Deleted Hinge after my first Campus Crush meetup. The difference is unreal — same school, shared vibe, actual chemistry.",
    initial: "J",
  },
];

export default function Testimonials() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  function scrollToCard(i: number) {
    const container = scrollRef.current;
    if (!container) return;
    const card = container.children[i] as HTMLElement;
    if (card) container.scrollTo({ left: card.offsetLeft - container.offsetLeft, behavior: "smooth" });
    setActiveIndex(i);
  }

  return (
    <section className="relative py-20 px-4 overflow-hidden" aria-labelledby="testimonials-heading">
      <Image src="/blurry-iceskating.jpeg" alt="" fill className="object-cover" aria-hidden="true" />
      <div className="absolute inset-0" style={{ background: "rgba(18,16,14,0.65)" }} aria-hidden="true" />

      <div className="relative" style={{ zIndex: 1 }}>
        <div className="flex justify-center mb-8">
          <div
            className="flex items-center gap-2 rounded-full px-4 py-2"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)" }}
          >
            <span className="text-xs text-white/60" aria-hidden="true">✓</span>
            <span className="font-jersey text-xs tracking-widest uppercase text-white/60">Verified Campus Students</span>
            <span className="text-xs text-white/60" aria-hidden="true">✓</span>
          </div>
        </div>

        <div className="text-center mb-10">
          <h2
            id="testimonials-heading"
            className="font-jersey text-[clamp(2rem,8vw,3.5rem)] leading-none tracking-widest text-white"
          >
            Real students.
            <br />
            Real sparks.
          </h2>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 scroll-snap-x"
          style={{ scrollbarWidth: "none" } as React.CSSProperties}
          aria-label="Student testimonials"
        >
          {testimonials.map((t) => (
            <article
              key={t.name}
              className="scroll-snap-start flex-shrink-0 w-72 p-5 rounded-2xl flex flex-col gap-4"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" } as React.CSSProperties}
              aria-label={`Testimonial from ${t.name}`}
            >
              <div role="img" aria-label="5 out of 5 stars">
                <span aria-hidden="true" className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="text-sm" style={{ color: "#c8a96e" }}>★</span>
                  ))}
                </span>
              </div>
              <p className="text-sm leading-relaxed flex-1 text-white/80">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-jersey text-sm flex-shrink-0 text-white/70"
                  style={{ background: "rgba(255,255,255,0.12)" }}
                  aria-hidden="true"
                >
                  {t.initial}
                </div>
                <div>
                  <p className="font-jersey tracking-widest text-sm text-white">{t.name}</p>
                  <p className="text-xs text-white/50">{t.detail} · Verified</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="flex justify-center gap-3 mt-6" role="tablist" aria-label="Testimonial navigation">
          {testimonials.map((t, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={activeIndex === i}
              aria-label={`View testimonial from ${t.name}`}
              onClick={() => scrollToCard(i)}
              className="flex items-center justify-center rounded-full transition-all"
              style={{ minWidth: "44px", minHeight: "44px" }}
            >
              <span
                className="rounded-full transition-all duration-300"
                style={{
                  width: activeIndex === i ? "20px" : "6px",
                  height: "6px",
                  backgroundColor: activeIndex === i ? "white" : "rgba(255,255,255,0.3)",
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
