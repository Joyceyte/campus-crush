"use client";
import { useState, useEffect } from "react";
import { useSignupCount, SIGNUP_GOAL } from "@/lib/useSignupCount";

// Bento photo tiles — grid-area letter (A–G) maps to the `grid-template-areas`
// in `.bento` (app/globals.css). gay-date / lesbian-date are deliberately
// spread (B and E) so they never cluster at the bottom of the grid.
const bentoTiles = [
  { src: "/blurry-iceskating.jpeg", area: "tile-a" },
  { src: "/gay-date.jpg", area: "tile-b" },
  { src: "/park-date.jpeg", area: "tile-c" },
  { src: "/beachdate.jpeg", area: "tile-d" },
  { src: "/lesbian-date.jpeg", area: "tile-e" },
  { src: "/noodle-date.jpeg", area: "tile-f" },
  { src: "/bar-date.jpeg", area: "tile-g" },
];

const rotatingPhrases = [
  "movie marathon",
  "pickleball rival",
  "bouldering duo",
  "running buddy",
  "hiking partner",
  "late night drive",
  "study session",
  "coffee date",
  "campus tour guide",
  "spontaneous adventure",
];

const steps = [
  {
    number: "01",
    title: "Tell us who you are",
    desc: "A short conversation with our AI. Not a quiz. We pick up on things you wouldn't think to write in a bio.",
  },
  {
    number: "02",
    title: "We find your match",
    desc: "Every Tuesday, our algorithm pairs you with one person, and tells you why you matched.",
  },
  {
    number: "03",
    title: "Just show up",
    desc: "We plan the perfect date. Time, place, even an icebreaker. You do the easy part.",
  },
];

function openWaitlist() {
  window.dispatchEvent(new CustomEvent("open-waitlist"));
}

export default function Hero() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const signups = useSignupCount();
  const spotsLeft = signups === null ? null : Math.max(0, SIGNUP_GOAL - signups);
  // Animated "spots left" — counts down from SIGNUP_GOAL (100) to the real
  // remaining count once, when the number first loads. Honors reduced motion.
  const [displayedSpots, setDisplayedSpots] = useState<number | null>(null);
  const [landed, setLanded] = useState(false);
  useEffect(() => {
    if (spotsLeft === null) return;
    const start = SIGNUP_GOAL;
    const end = spotsLeft;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce || start === end) {
      setDisplayedSpots(end);
      setLanded(true);
      return;
    }
    const duration = 900;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setDisplayedSpots(Math.round(start + (end - start) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setLanded(true); // triggers the one-time settle-pulse
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [spotsLeft]);

  useEffect(() => {
    const id = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setPhraseIndex((i) => (i + 1) % rotatingPhrases.length);
        setFading(false);
      }, 320);
    }, 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      {/* ── Fold 1: Bento split — left text panel + right photo grid ── */}
      <section className="hero-bento" aria-labelledby="hero-heading">
        {/* Left: navy text panel (desktop) / photo-background hero (mobile) */}
        <div className="hero-panel grain">
          <div
            className="leading-[0.88] tracking-widest"
            aria-live="polite"
            aria-atomic="true"
          >
            {/* Static label — does NOT wobble */}
            <h1
              id="hero-heading"
              className="font-jersey text-[clamp(1rem,3vw,1.5rem)] tracking-[0.3em] uppercase text-[#2B1B12]/60"
            >
              meet your
            </h1>
            {/* Only the interchanging phrase wobbles. It's an inline-block so it
                shrinks to its own width and inherits the panel's alignment —
                left-indented on desktop, centered on the mobile photo hero. */}
            <span className="wiggle-text" style={{ display: "inline-block" }}>
              <p
                className="font-jersey text-[clamp(3rem,7vw,4.5rem)] text-[#2B1B12]/90"
                style={{
                  opacity: fading ? 0 : 1,
                  transform: fading ? "translateY(-12px)" : "translateY(0)",
                  transition: "opacity 0.32s ease, transform 0.32s ease",
                  margin: 0,
                }}
              >
                {rotatingPhrases[phraseIndex]}
              </p>
            </span>
            {/* Static label — does NOT wobble */}
            <p className="font-jersey text-[clamp(0.75rem,2vw,1rem)] tracking-[0.3em] uppercase text-[#2B1B12]/45 mt-3">
              this winter
            </p>
          </div>

          <p style={{
            fontSize: '0.78rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            fontWeight: 700,
            color: 'var(--ink)',
            marginBottom: '2rem',
            marginTop: '1.5rem',
          }}>
            Launching at University of Melbourne
            <span className="hidden sm:inline"> · </span>
            <br className="sm:hidden" />
            Winter 2026
          </p>

          <div>
            <button
              className="neon-btn"
              onClick={openWaitlist}
              aria-label="Join the Campus Crush waitlist"
            >
              Join the Waitlist →
            </button>
            <div style={{ marginTop: '1.1rem' }}>
              {/* Scarcity number — the focal point. Space is reserved so the
                  fade-in never shifts the content below it. */}
              <div style={{ minHeight: '1.7em', display: 'flex', alignItems: 'baseline', gap: '0.45rem' }}>
                {spotsLeft !== null && spotsLeft > 0 && (
                  <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: '0.45rem', animation: 'fadeIn 0.4s ease' }}>
                    <span
                      className="font-jersey"
                      style={{
                        display: 'inline-block',
                        fontSize: '1.5rem',
                        lineHeight: 1,
                        letterSpacing: '0.02em',
                        color: 'var(--terracotta)',
                        fontVariantNumeric: 'tabular-nums',
                        textShadow: '0 0 12px rgba(193,81,47,0.5)',
                        animation: landed ? 'spotPulse 0.25s ease' : undefined,
                      }}
                    >
                      {displayedSpots ?? spotsLeft}
                    </span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(43,27,18,0.85)' }}>
                      spots left
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: bento photo grid — decorative, no captions */}
        <div className="bento">
          {bentoTiles.map((tile) => (
            <div key={tile.src} className={`bento-tile grain-heavy ${tile.area}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={tile.src} alt="" />
            </div>
          ))}
        </div>
      </section>

      {/* ── Fold 2: How It Works — solid navy (carousel removed) ── */}
      <section
        aria-labelledby="how-it-works-heading"
        className="grain"
        style={{
          position: "relative",
          overflow: "hidden",
          background: "var(--parchment)",
        }}
      >
        <div className="relative" style={{ zIndex: 1, padding: "6rem 1.5rem", textAlign: "center" }}>
          <p
            id="how-it-works-heading"
            className="section-label"
            style={{ color: 'var(--terracotta)', borderColor: 'rgba(193,81,47,0.35)', background: 'rgba(193,81,47,0.10)' }}
          >
            user journey
          </p>

          {/* Three columns — dark glass step cards */}
          <div className="cols-3" style={{ gap: "1.25rem" }}>
            {steps.map((step) => (
              <div
                key={step.title}
                style={{
                  background: "var(--parchment-deep)",
                  border: "1px solid rgba(43,27,18,0.14)",
                  borderRadius: "1.25rem",
                  padding: "2rem 1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  gap: "0.75rem",
                }}
              >
                <span
                  className="font-jersey"
                  style={{
                    fontSize: "3.5rem",
                    lineHeight: 1,
                    color: "var(--terracotta)",
                    textShadow: "0 0 20px rgba(193,81,47,0.35), 0 0 40px rgba(193,81,47,0.18)",
                    letterSpacing: "-0.02em",
                  }}
                  aria-hidden="true"
                >
                  {step.number}
                </span>
                <h3 className="font-jersey" style={{ fontSize: "1.2rem", letterSpacing: "0.08em", color: "var(--ink)", lineHeight: 1.2 }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: "0.78rem", color: "rgba(43,27,18,0.75)", lineHeight: 1.7 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
