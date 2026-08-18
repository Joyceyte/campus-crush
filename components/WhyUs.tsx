"use client";

function openWaitlist() {
  window.dispatchEvent(new CustomEvent("open-waitlist"));
}

const notifications = [
  { emoji: "🔥", app: "Tinder", text: "You have 14 new likes", color: "#FF4458", top: 0, left: 20, rotate: -3 },
  { emoji: "💬", app: "Hinge", text: "Someone commented on your prompt", color: "#9933CC", top: 40, left: 0, rotate: 2 },
  { emoji: "🔥", app: "Tinder", text: "Your match expired!", color: "#FF4458", top: 80, left: 30, rotate: -1 },
  { emoji: "💬", app: "Hinge", text: "She's popular, send something unique", color: "#9933CC", top: 120, left: 10, rotate: 3 },
  { emoji: "🔥", app: "Tinder", text: "Boost now to get 10x more matches", color: "#FF4458", top: 160, left: 40, rotate: -2 },
  { emoji: "💬", app: "Hinge", text: "Rose sent!", color: "#9933CC", top: 200, left: 5, rotate: 1 },
];

const features = [
  {
    icon: (
      <img src="/twemoji/1f393.png" width="40" height="40" alt="" aria-hidden="true" style={{ imageRendering: 'auto' }} />
    ),
    title: "Uni students",
    desc: "You are only matched with other university students.",
  },
  {
    icon: (
      <img src="/twemoji/1f512.png" width="40" height="40" alt="" aria-hidden="true" style={{ imageRendering: 'auto' }} />
    ),
    title: "Private by default",
    desc: "Your profile only gets shown to the person you're matched with.",
  },
  {
    icon: (
      <img src="/twemoji/2705.png" width="40" height="40" alt="" aria-hidden="true" style={{ imageRendering: 'auto' }} />
    ),
    title: "We do the work",
    desc: "No swiping. We do everything for your first date, all you need to do is accept.",
  },
];

export default function WhyUs() {
  return (
    <section
      id="why-us"
      aria-labelledby="why-us-heading"
      className="grain-heavy"
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "92vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        paddingTop: "5rem",
        paddingBottom: "5rem",
      }}
    >
      {/* Full-bleed blurred photo backdrop */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/bar-date.jpeg"
        alt=""
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.72) brightness(1.1) contrast(0.9) sepia(0.14)", transform: "scale(1.06)", opacity: 1 }}
      />
      {/* Light warmth glaze — text contrast now comes from the paper-plate cards, not this scrim */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(247,239,225,0.15) 0%, rgba(247,239,225,0.3) 100%)" }} />

      {/* ── TOP HALF: Anti-App ── */}
      <div className="section-pad relative" style={{ zIndex: 5 }}>
        <div className="cols-2" style={{ maxWidth: "64rem", gap: "4rem" }}>
          {/* Left column */}
          <div className="paper-plate grain" style={{ display: "flex", flexDirection: "column", gap: "1.25rem", textAlign: "center" }}>
            <h2
              id="why-us-heading"
              className="font-jersey"
              style={{
                fontSize: "clamp(2.2rem, 5vw, 3.75rem)",
                lineHeight: 1.05,
                letterSpacing: "0.02em",
                color: "var(--terracotta)",
              }}
            >
              Tired of Tinder and Hinge
            </h2>
            <p
              style={{
                fontSize: "0.95rem",
                color: "rgba(43,27,18,0.80)",
                lineHeight: 1.6,
                maxWidth: "40ch",
                margin: "0 auto",
              }}
            >
              Swipe culture wasn&apos;t built for campus. Campus Crush is.
            </p>
          </div>

          {/* Right column — notification chaos graphic */}
          <div
            aria-hidden="true"
            style={{
              position: "relative",
              width: "300px",
              height: "280px",
              margin: "0 auto",
            }}
          >
            {notifications.map((n, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top: n.top,
                  left: n.left,
                  width: "240px",
                  background: "var(--parchment-deep)",
                  borderLeft: `3px solid ${n.color}`,
                  borderRadius: "8px",
                  padding: "0.6rem 0.9rem",
                  transform: `rotate(${n.rotate}deg)`,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.2rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <span style={{ fontSize: "0.75rem" }}>{n.emoji}</span>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      color: "var(--ink)",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}
                  >
                    {n.app}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "0.7rem",
                    color: "rgba(43,27,18,0.6)",
                    lineHeight: 1.4,
                  }}
                >
                  {n.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOTTOM HALF: Matchmaker ── */}
      <div className="section-pad relative" style={{ zIndex: 5, paddingTop: "1rem" }}>
        <div
          style={{
            maxWidth: "52rem",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "1.25rem",
          }}
        >
          <div className="paper-plate grain" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <h2
              className="font-jersey"
              style={{
                fontSize: "clamp(2.2rem, 5vw, 3.75rem)",
                lineHeight: 1.05,
                letterSpacing: "0.02em",
                color: "var(--terracotta)",
              }}
            >
              Your Matchmaker
            </h2>
            <p
              style={{
                fontSize: "0.95rem",
                color: "rgba(43,27,18,0.80)",
                lineHeight: 1.6,
                maxWidth: "40ch",
                margin: "0 auto",
              }}
            >
              An AI matchmaker that learns exactly what you&apos;re into.
            </p>
          </div>

          {/* ── Match card: a play on the dating "It's a Match" card —
               your match is Campus Crush, and the features are the reasons why ── */}
          <div
            className="grain"
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "30rem",
              margin: "2.5rem auto 0",
              textAlign: "left",
              background: "var(--parchment-deep)",
              border: "1px solid rgba(193,81,47,0.35)",
              borderRadius: "1.75rem",
              padding: "1.9rem 1.6rem 1.6rem",
              overflow: "hidden",
              boxShadow: "0 24px 70px rgba(43,27,18,0.18), inset 0 1px 0 rgba(255,255,255,0.4)",
            }}
          >
            {/* Match-found ping */}
            <span
              className="font-jersey"
              aria-hidden="true"
              style={{
                position: "absolute",
                top: "1.1rem",
                right: "1.1rem",
                fontSize: "0.72rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--terracotta)",
                textShadow: "0 0 10px rgba(193,81,47,0.35)",
              }}
            >
              ● Match found
            </span>

            {/* Avatars — your type ♥ Campus Crush (footer logo) */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "0.25rem 0 0.9rem" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/noodle-date.jpeg"
                alt=""
                aria-hidden="true"
                style={{
                  width: "84px",
                  height: "84px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid var(--parchment)",
                  marginRight: "-14px",
                  boxShadow: "0 6px 20px rgba(43,27,18,0.5)",
                }}
              />
              <span
                aria-hidden="true"
                style={{
                  position: "relative",
                  zIndex: 2,
                  width: "46px",
                  height: "46px",
                  borderRadius: "50%",
                  background: "var(--parchment)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.4rem",
                  color: "var(--terracotta)",
                  boxShadow: "0 6px 18px rgba(193,81,47,0.35)",
                }}
              >
                ♥
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-footer.png"
                alt="Campus Crush"
                style={{
                  width: "84px",
                  height: "84px",
                  borderRadius: "50%",
                  objectFit: "contain",
                  background: "var(--parchment)",
                  padding: "9px",
                  border: "3px solid var(--terracotta)",
                  marginLeft: "-14px",
                  boxShadow: "0 6px 20px rgba(43,27,18,0.5)",
                }}
              />
            </div>

            <div
              className="font-jersey"
              style={{
                textAlign: "center",
                fontSize: "2.2rem",
                lineHeight: 1,
                letterSpacing: "0.04em",
                color: "var(--ink)",
                marginBottom: "0.25rem",
              }}
            >
              It&apos;s a Match!
            </div>
            <p style={{ textAlign: "center", color: "rgba(43,27,18,0.72)", fontSize: "0.82rem", marginBottom: "1.4rem" }}>
              You &amp; Campus Crush are a perfect pair. Here&apos;s why:
            </p>

            <p
              className="font-jersey"
              style={{
                fontSize: "0.72rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(43,27,18,0.55)",
                margin: "0 0 0.4rem 0.1rem",
              }}
            >
              Reasons you match
            </p>

            {features.map((f, i) => (
              <div
                key={f.title}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.75rem",
                  padding: "0.7rem 0",
                  borderTop: i === 0 ? "none" : "1px solid rgba(43,27,18,0.12)",
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    flex: "0 0 auto",
                    width: "48px",
                    height: "48px",
                    borderRadius: "0.75rem",
                    background: "rgba(193,81,47,0.12)",
                    border: "1px solid rgba(193,81,47,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {f.icon}
                </span>
                <div>
                  <h3 className="font-jersey" style={{ fontSize: "1rem", letterSpacing: "0.06em", color: "var(--ink)", margin: "0.15rem 0 0.15rem" }}>
                    {f.title}
                  </h3>
                  <p style={{ fontSize: "0.76rem", lineHeight: 1.5, color: "rgba(43,27,18,0.66)" }}>{f.desc}</p>
                </div>
              </div>
            ))}

            <button
              className="neon-btn"
              onClick={openWaitlist}
              aria-label="Join the Campus Crush waitlist"
              style={{ marginTop: "1.4rem", width: "100%", justifyContent: "center" }}
            >
              See your match →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
