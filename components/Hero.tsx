"use client";
import { useState, useEffect } from "react";
import { useSignupCount, SIGNUP_GOAL } from "@/lib/useSignupCount";

const carouselImages = [
  "/blurry-iceskating.jpeg",
  "/beachdate.jpeg",
  "/bar-date.jpeg",
  "/noodle-date.jpeg",
  "/park-date.jpeg",
  "/gay-date.jpg",
  "/lesbian-date.jpeg",
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
    title: "Tell us your type",
    desc: "Every Tuesday is the Tuesday Drop. Check your iMessage at 7pm. We'll send you a personalized match and a curated date, just for you.",
  },
  {
    number: "02",
    title: "The Tuesday Drop",
    desc: "Confirm your match and lock in a time. We handle the spot, the vibe, and everything in between.",
  },
  {
    number: "03",
    title: "Have fun",
    desc: "Show up as yourself. No pressure, no swiping, just a real campus connection.",
  },
];

function openWaitlist() {
  window.dispatchEvent(new CustomEvent("open-waitlist"));
}

export default function Hero() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
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
      }, 380);
    }, 2800);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setImgIndex((i) => (i + 1) % carouselImages.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      {/* ── Fixed photo carousel behind everything ── */}
      <div style={{ position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none" }}>
        {carouselImages.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            src={src}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center 40%",
              filter: "saturate(0.9) brightness(0.92)",
              opacity: i === imgIndex ? 1 : 0,
              transition: "opacity 1.4s ease-in-out",
            }}
          />
        ))}
        <div style={{ position: "absolute", inset: 0, background: "rgba(6,12,22,0.42)" }} />
      </div>

      {/* ── Fold 1: Landing view — transparent, shows carousel ── */}
      <section
        className="flex flex-col items-center justify-center text-center px-6 grain"
        style={{
          minHeight: "100vh",
          position: "relative",
          overflow: "hidden",
        }}
        aria-labelledby="hero-heading"
      >
        <div
          className="wiggle-text flex flex-col items-center leading-[0.88] tracking-widest"
          aria-live="polite"
          aria-atomic="true"
        >
          <h1
            id="hero-heading"
            className="font-jersey text-[clamp(1rem,3vw,1.5rem)] tracking-[0.3em] uppercase text-white/60"
          >
            meet your
          </h1>
          <p
            className="font-jersey text-[clamp(3.2rem,11vw,7.5rem)] text-white/90"
            style={{
              opacity: fading ? 0 : 1,
              transform: fading ? "translateY(-12px)" : "translateY(0)",
              transition: "opacity 0.32s ease, transform 0.32s ease",
              textShadow: "0 2px 24px rgba(0,0,0,0.55)",
            }}
          >
            {rotatingPhrases[phraseIndex]}
          </p>
          <p className="font-jersey text-[clamp(0.75rem,2vw,1rem)] tracking-[0.3em] uppercase text-white/45 mt-3">
            this winter
          </p>
        </div>

        <p style={{
          fontSize: '0.78rem',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          fontWeight: 700,
          color: '#ffffff',
          textShadow: '0 1px 8px rgba(0,0,0,0.5)',
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
          <div style={{ marginTop: '1.1rem', textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}>
            {/* Scarcity number — the focal point. Space is reserved so the
                fade-in never shifts the benefit line below it. */}
            <div style={{ minHeight: '1.7em', display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.45rem' }}>
              {spotsLeft !== null && spotsLeft > 0 && (
                <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: '0.45rem', animation: 'fadeIn 0.4s ease' }}>
                  <span
                    className="font-jersey"
                    style={{
                      display: 'inline-block',
                      fontSize: '1.5rem',
                      lineHeight: 1,
                      letterSpacing: '0.02em',
                      color: '#ff1f71',
                      fontVariantNumeric: 'tabular-nums',
                      textShadow: '0 0 12px rgba(255,31,113,0.5)',
                      animation: landed ? 'spotPulse 0.25s ease' : undefined,
                    }}
                  >
                    {displayedSpots ?? spotsLeft}
                  </span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)' }}>
                    spots left
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>

      </section>

      {/* ── Fold 2: How It Works — transparent, shows carousel behind ── */}
      <section
        aria-labelledby="how-it-works-heading"
        className="grain"
        style={{
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="relative" style={{ zIndex: 1, padding: "6rem 1.5rem", textAlign: "center" }}>
          <p
            id="how-it-works-heading"
            className="section-label"
            style={{ color: '#ff1f71', borderColor: 'rgba(255,31,113,0.35)', background: 'rgba(255,31,113,0.10)' }}
          >
            how it works
          </p>

          {/* Three columns — dark glass step cards */}
          <div className="cols-3" style={{ gap: "1.25rem" }}>
            {steps.map((step) => (
              <div
                key={step.title}
                style={{
                  background: "rgba(0,0,0,0.55)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  border: "1px solid rgba(255,255,255,0.12)",
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
                    color: "#ff1f71",
                    textShadow: "0 0 20px rgba(255,31,113,0.6), 0 0 40px rgba(255,31,113,0.3)",
                    letterSpacing: "-0.02em",
                  }}
                  aria-hidden="true"
                >
                  {step.number}
                </span>
                <h3 className="font-jersey" style={{ fontSize: "1.2rem", letterSpacing: "0.08em", color: "#ffffff", lineHeight: 1.2 }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.72)", lineHeight: 1.7 }}>
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
