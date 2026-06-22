"use client";
import { useState } from "react";

const faqs = [
  {
    q: "How does the Wednesday Drop work?",
    a: "Every Wednesday at 7pm, you'll get an iMessage from us with your match for the week. We pick someone compatible on your campus and suggest a date idea — all you have to do is say yes.",
  },
  {
    q: "Who can join Campus Crush?",
    a: "Right now we're launching exclusively at the University of Melbourne. Every profile is verified with a student email, so you'll only ever meet real students.",
  },
  {
    q: "What if I'm not feeling the match?",
    a: "No pressure. You can pass on any match — and we'll use that to get smarter about what works for you. Every answer teaches Campus Crush more.",
  },
  {
    q: "Is my profile public?",
    a: "Never. Your profile is only visible to the person we match you with that week. No strangers, no swiping, no public listing.",
  },
  {
    q: "What does a Campus Crush date look like?",
    a: "Always a casual campus coffee or a walk — something low-pressure and familiar. We pick the spot and time based on both your schedules. It's meant to feel easy.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggle(i: number) {
    setOpenIndex(openIndex === i ? null : i);
  }

  return (
    <section
      aria-labelledby="faq-heading"
      className="grain-heavy"
      style={{ position: "relative", overflow: "hidden", minHeight: "92vh", display: "flex", flexDirection: "column", justifyContent: "center", paddingTop: "5rem", paddingBottom: "5rem" }}
    >
      {/* Full-bleed blurred photo backdrop */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/blurry-iceskating.jpeg"
        alt=""
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "blur(3px)", transform: "scale(1.06)", opacity: 1 }}
      />
      {/* Single scrim for text legibility */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(6,12,22,0.55) 0%, rgba(6,12,22,0.72) 100%)" }} />

      {/* Content */}
      <div className="section-pad relative" style={{ zIndex: 5, textAlign: "center" }}>
        <h2
          id="faq-heading"
          className="font-jersey"
          style={{
            fontSize: "clamp(2rem, 8vw, 3.5rem)",
            lineHeight: 1.05,
            letterSpacing: "0.02em",
            background: "linear-gradient(135deg, #ffffff 55%, #ff1f71 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Everything you need to know
        </h2>

        {/* ONE combined glass container */}
        <div
          style={{
            background: "rgba(255,255,255,0.07)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "1.25rem",
            overflow: "hidden",
            maxWidth: "42rem",
            margin: "3rem auto 0",
          }}
        >
          {faqs.map((faq, i) => (
            <div key={i}>
              {i > 0 && <div style={{ borderTop: "1px solid rgba(255,255,255,0.10)" }} />}
              <button
                className="faq-question-btn"
                onClick={() => toggle(i)}
                aria-expanded={openIndex === i}
                style={{
                  width: "100%",
                  padding: "1.25rem 1.5rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span
                  className="font-jersey"
                  style={{ fontSize: "1rem", letterSpacing: "0.05em", color: "#ffffff" }}
                >
                  {faq.q}
                </span>
                <span
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: "1.2rem",
                    flexShrink: 0,
                    marginLeft: "1rem",
                  }}
                  aria-hidden="true"
                >
                  {openIndex === i ? "−" : "+"}
                </span>
              </button>
              {openIndex === i && (
                <div
                  className="faq-answer"
                  style={{
                    padding: "0 1.5rem 1.25rem",
                    fontSize: "0.85rem",
                    lineHeight: 1.7,
                    color: "rgba(255,255,255,0.70)",
                  }}
                >
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
