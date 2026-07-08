"use client";
import { useState } from "react";

const faqs = [
  {
    q: "How does the Tuesday Drop work?",
    a: "Every Tuesday at 7pm you'll get a message with your match for the week — who they are, why you matched, and a date we've already planned (time, place, even an icebreaker). All you have to do is say yes.",
  },
  {
    q: "How does Campus Crush pair people?",
    a: "It starts with a short conversation with our AI — not a quiz. From it we learn your values, personality, interests and dealbreakers. Each week our algorithm scores everyone you could meet on both what you have in common and the ways you balance each other out, then pairs you with your most compatible match.",
  },
  {
    q: "Do I write a profile or bio?",
    a: "No. Your profile is built from your conversation with the AI, not a bio you craft. You can fix factual details like your faculty or year and set your dealbreakers, but you can't rewrite it — that honesty is the whole point.",
  },
  {
    q: "Who can join Campus Crush?",
    a: "Right now we're launching exclusively at the University of Melbourne. Every profile is verified with a student email, and you're only ever matched with other students at your university.",
  },
  {
    q: "What if I'm not feeling the match?",
    a: "No pressure. You can pass on any match, and we'll use that to get smarter about what works for you. Every answer teaches Campus Crush more.",
  },
  {
    q: "Is my profile public?",
    a: "Never. Your profile is only ever shown to the person we match you with that week. No strangers, no swiping, no public listing.",
  },
  {
    q: "What does a Campus Crush date look like?",
    a: "We plan the whole thing. It might be a cafe, a gallery, a market, live music, or a walk in the park — chosen around what you'd both enjoy and both your schedules — with a time and an icebreaker to get you started.",
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
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.72) brightness(1.1) contrast(0.9) sepia(0.14)", transform: "scale(1.06)", opacity: 1 }}
      />
      {/* Single scrim for text legibility */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(247,239,225,0.6) 0%, rgba(247,239,225,0.8) 100%)" }} />

      {/* Content */}
      <div className="section-pad relative" style={{ zIndex: 5, textAlign: "center" }}>
        <h2
          id="faq-heading"
          className="font-jersey"
          style={{
            fontSize: "clamp(2rem, 8vw, 3.5rem)",
            lineHeight: 1.05,
            letterSpacing: "0.02em",
            color: "var(--terracotta)",
          }}
        >
          Everything you need to know
        </h2>

        {/* ONE combined glass container */}
        <div
          style={{
            background: "var(--parchment-deep)",
            border: "1px solid rgba(43,27,18,0.14)",
            borderRadius: "1.25rem",
            overflow: "hidden",
            maxWidth: "42rem",
            margin: "3rem auto 0",
          }}
        >
          {faqs.map((faq, i) => (
            <div key={i}>
              {i > 0 && <div style={{ borderTop: "1px solid rgba(43,27,18,0.12)" }} />}
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
                  style={{ fontSize: "1rem", letterSpacing: "0.05em", color: "var(--ink)" }}
                >
                  {faq.q}
                </span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgba(43,27,18,0.55)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{
                    flexShrink: 0,
                    marginLeft: "1rem",
                    transform: openIndex === i ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {/* grid-rows accordion — smooth height transition, no layout snap */}
              <div
                style={{
                  display: "grid",
                  gridTemplateRows: openIndex === i ? "1fr" : "0fr",
                  transition: "grid-template-rows 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              >
                <div style={{ overflow: "hidden", minHeight: 0 }}>
                  <div
                    className="faq-answer"
                    style={{
                      padding: "0 1.5rem 1.25rem",
                      fontSize: "0.85rem",
                      lineHeight: 1.7,
                      color: "rgba(43,27,18,0.72)",
                      opacity: openIndex === i ? 1 : 0,
                      transition: "opacity 0.35s ease",
                    }}
                  >
                    {faq.a}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
