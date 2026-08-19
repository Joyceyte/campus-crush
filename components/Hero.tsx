"use client";
import { useState, useEffect } from "react";
import { useSignupCount, SIGNUP_GOAL } from "@/lib/useSignupCount";
import LaunchBanner from "@/components/LaunchBanner";
import InstagramShowcase from "@/components/InstagramShowcase";

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

// Each step is a torn page glued into the scrapbook: a paper variety
// (ruled / grid / kraft), a slight off-kilter tilt, and its own tape angle
// so the three cards don't look machine-placed.
const steps = [
  {
    number: "01",
    title: "Tell us who you are",
    desc: "A short conversation with our AI. We pick up on things you wouldn't think to write in a bio.",
    paper: "scrap-card--ruled",
    tilt: -1.6,
    tapeTilt: -5,
  },
  {
    number: "02",
    title: "We find your match",
    desc: "Every Tuesday, our algorithm pairs you with one person, and tells you why you matched.",
    paper: "scrap-card--grid",
    tilt: 1.1,
    tapeTilt: 4,
  },
  {
    number: "03",
    title: "Just show up",
    desc: "We plan the perfect date. Time, place, even an icebreaker. You do the easy part.",
    paper: "scrap-card--kraft",
    tilt: -0.8,
    tapeTilt: -3,
  },
];

function openWaitlist() {
  window.dispatchEvent(new CustomEvent("open-waitlist"));
}

function openJoinPilot() {
  window.dispatchEvent(new CustomEvent("open-join-pilot"));
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
              semester 2, 2026
            </p>
          </div>

          <div style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
            <p style={{
              fontSize: '0.78rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              fontWeight: 700,
              color: 'var(--ink)',
            }}>
              Piloting semester 2, 2026 &middot; UniMelb.
            </p>
            <p style={{
              fontSize: '0.7rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              fontWeight: 600,
              color: 'rgba(43,27,18,0.6)',
              marginTop: '0.5rem',
            }}>
              Coming soon to Monash, Deakin, RMIT, and La Trobe.
            </p>
          </div>

          <div>
            <div style={{ position: "relative", display: "inline-block" }}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="var(--terracotta)"
                aria-hidden="true"
                style={{ position: "absolute", top: "-8px", right: "-8px", pointerEvents: "none" }}
              >
                <path d="M12 0l2.5 8.5L23 11l-8.5 2.5L12 22l-2.5-8.5L1 11l8.5-2.5z" />
              </svg>
              <button
                className="neon-btn"
                onClick={openJoinPilot}
                aria-label="Join the Campus Crush semester 2 pilot"
              >
                Join the pilot →
              </button>
            </div>
            <div className="hero-closing-link" style={{ marginTop: '1.1rem' }}>
              <div className="hero-closing-row" style={{ display: 'flex', alignItems: 'baseline', gap: '0.45rem', flexWrap: 'wrap' }}>
                <span
                  className="font-jersey"
                  style={{
                    fontSize: '1.5rem',
                    lineHeight: 1,
                    letterSpacing: '0.02em',
                    color: 'var(--terracotta)',
                    textShadow: '0 0 12px rgba(193,81,47,0.5)',
                  }}
                >
                  ✦
                </span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(43,27,18,0.85)' }}>
                  closing soon
                </span>
              </div>
              <button
                type="button"
                onClick={openWaitlist}
                style={{
                  marginTop: '0.7rem',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'rgba(43,27,18,0.6)',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                }}
              >
                Not at UniMelb? Get updates →
              </button>
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

        {/* Typing banner — a grid row of the hero, so it stays in the first fold */}
        <LaunchBanner />
      </section>

      {/* Bouncing hint that there's more below the fold */}
      <div className="scroll-hint" aria-hidden="true">
        <span className="font-jersey" style={{ fontSize: '1.5rem', color: 'var(--terracotta)' }}>
          ↓
        </span>
      </div>

      <InstagramShowcase />

      {/* ── Fold 2: User journey — scrapbook spread ── */}
      <section
        id="how-it-works"
        aria-labelledby="how-it-works-heading"
        className="grain"
        style={{
          scrollMarginTop: "5rem",
          position: "relative",
          overflow: "hidden",
          background: "var(--parchment)",
        }}
      >
        {/* Faded torn sheets scattered behind the cards — decorative only */}
        <div aria-hidden="true" className="scrap-sheet"
          style={{ top: "-2rem", left: "-4rem", width: "20rem", height: "14rem", transform: "rotate(-13deg)" }} />
        <div aria-hidden="true" className="scrap-sheet"
          style={{ bottom: "-3rem", right: "-5rem", width: "24rem", height: "16rem", transform: "rotate(9deg)" }} />
        <div aria-hidden="true" className="scrap-sheet"
          style={{ top: "-3.5rem", right: "18%", width: "14rem", height: "10rem", transform: "rotate(6deg)", opacity: 0.35 }} />

        <div className="relative" style={{ zIndex: 1, padding: "6rem 1.5rem", textAlign: "center" }}>
          <p id="how-it-works-heading" className="tape-label">
            user journey
          </p>

          {/* Three torn pages taped into the spread. The clip-path on
              .scrap-card would clip the tape, so it sits on the wrapper. */}
          <div className="cols-3" style={{ gap: "1.75rem" }}>
            {steps.map((step) => (
              <div
                key={step.title}
                className="scrap-wrap"
                style={{ transform: `rotate(${step.tilt}deg)` }}
              >
                <div
                  aria-hidden="true"
                  className="washi"
                  style={{ transform: `translateX(-50%) rotate(${step.tapeTilt}deg)` }}
                />
                <div className={`scrap-card ${step.paper}`}>
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
                  <p style={{ fontSize: "0.78rem", color: "var(--ink)", lineHeight: 1.7 }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
