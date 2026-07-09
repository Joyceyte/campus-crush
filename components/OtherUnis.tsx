"use client";

function openOtherUniWaitlist() {
  window.dispatchEvent(new CustomEvent("open-waitlist", { detail: { cohort: "other" } }));
}

export default function OtherUnis() {
  return (
    <section
      id="other-unis"
      aria-labelledby="other-unis-heading"
      className="grain"
      style={{ background: "var(--parchment-deep)", padding: "3.5rem 1.25rem" }}
    >
      <div
        style={{
          maxWidth: "36rem",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: "0.9rem",
        }}
      >
        <h2
          id="other-unis-heading"
          className="font-jersey"
          style={{ fontSize: "clamp(1.6rem, 4vw, 2.25rem)", letterSpacing: "0.04em", color: "var(--ink)" }}
        >
          Not a UniMelb student?
        </h2>
        <p style={{ fontSize: "0.9rem", color: "rgba(43,27,18,0.72)", lineHeight: 1.7 }}>
          Sign up to our Melbourne-wide unis waitlist — open to Monash, Deakin, and RMIT students.
        </p>
        <button
          className="neon-btn"
          onClick={openOtherUniWaitlist}
          aria-label="Join the Melbourne-wide unis waitlist"
          style={{ marginTop: "0.5rem" }}
        >
          Join the Waitlist →
        </button>
      </div>
    </section>
  );
}
