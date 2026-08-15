"use client";

export default function FinalCTA() {
  function handleWaitlist() {
    window.dispatchEvent(new CustomEvent("open-waitlist"));
  }

  return (
    <section
      id="waitlist-cta"
      className="grain-heavy"
      style={{ position: "relative", overflow: "hidden", minHeight: "92vh", display: "flex", flexDirection: "column", justifyContent: "center", paddingTop: "5rem", paddingBottom: "5rem" }}
      aria-labelledby="cta-heading"
    >
      {/* Full-bleed blurred photo backdrop */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/noodle-date.jpeg"
        alt=""
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "saturate(0.72) brightness(1.1) contrast(0.9) sepia(0.14)",
          transform: "scale(1.06)",
          opacity: 1,
        }}
      />
      {/* Light warmth glaze — text contrast now comes from the paper-plate card, not this scrim */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(247,239,225,0.12) 0%, rgba(247,239,225,0.25) 100%)" }} />

      {/* Content */}
      <div className="section-pad relative" style={{ zIndex: 5, textAlign: "center", minHeight: "360px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div className="paper-plate grain" style={{ marginBottom: "1.75rem" }}>
          <h2
            id="cta-heading"
            className="font-jersey"
            style={{
              fontSize: "clamp(2.5rem, 10vw, 5.5rem)",
              lineHeight: 1,
              letterSpacing: "0.06em",
              marginBottom: "0.75rem",
              color: "var(--terracotta)",
            }}
          >
            Date Without Swiping.
          </h2>
          <p style={{ fontSize: '0.875rem', maxWidth: '34ch', margin: '0 auto', color: 'rgba(43,27,18,0.66)', lineHeight: 1.7 }}>
            Not at UniMelb, or not ready for the pilot? Get updates and be the first to know
            when Campus Crush opens up at{' '}
            <span style={{ color: 'var(--ink)', fontWeight: 600 }}>your university</span>.
          </p>
        </div>
        <button
          className="neon-btn"
          onClick={handleWaitlist}
          aria-label="Get Campus Crush updates by email"
        >
          Get updates →
        </button>
      </div>
    </section>
  );
}
