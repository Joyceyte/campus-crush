const notifications = [
  { emoji: "🔥", app: "Tinder", text: "You have 14 new likes", color: "#FF4458", top: 0, left: 20, rotate: -3 },
  { emoji: "💬", app: "Hinge", text: "Someone commented on your prompt", color: "#9933CC", top: 40, left: 0, rotate: 2 },
  { emoji: "🔥", app: "Tinder", text: "Your match expired!", color: "#FF4458", top: 80, left: 30, rotate: -1 },
  { emoji: "💬", app: "Hinge", text: "She's popular — send something unique", color: "#9933CC", top: 120, left: 10, rotate: 3 },
  { emoji: "🔥", app: "Tinder", text: "Boost now to get 10x more matches", color: "#FF4458", top: 160, left: 40, rotate: -2 },
  { emoji: "💬", app: "Hinge", text: "Rose sent!", color: "#9933CC", top: 200, left: 5, rotate: 1 },
];

const features = [
  {
    icon: (
      <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f9e0.png" width="40" height="40" alt="" aria-hidden="true" style={{ imageRendering: 'auto' }} />
    ),
    title: "Learns your type",
    desc: "Not just your likes — your patterns. The more you go on dates, the smarter it gets.",
  },
  {
    icon: (
      <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f50d.png" width="40" height="40" alt="" aria-hidden="true" style={{ imageRendering: 'auto' }} />
    ),
    title: "Scans the whole pool",
    desc: "We match across your entire campus, not just who swiped right.",
  },
  {
    icon: (
      <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/2728.png" width="40" height="40" alt="" aria-hidden="true" style={{ imageRendering: 'auto' }} />
    ),
    title: "Gets better every date",
    desc: "Each date teaches Campus Crush more about what actually works for you.",
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
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "blur(3px)", transform: "scale(1.06)", opacity: 1 }}
      />
      {/* Single scrim for text legibility */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(6,12,22,0.45) 0%, rgba(6,12,22,0.62) 100%)" }} />

      {/* ── TOP HALF: Anti-App ── */}
      <div className="section-pad relative" style={{ zIndex: 5 }}>
        <div className="cols-2" style={{ maxWidth: "64rem", gap: "4rem" }}>
          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", textAlign: "center" }}>
            <h2
              id="why-us-heading"
              className="font-jersey"
              style={{
                fontSize: "clamp(2.2rem, 5vw, 3.75rem)",
                lineHeight: 1.05,
                letterSpacing: "0.02em",
                background: "linear-gradient(135deg, #ffffff 55%, #ff1f71 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Tired of Tinder and Hinge
            </h2>
            <p
              style={{
                fontSize: "0.95rem",
                color: "rgba(255,255,255,0.80)",
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
                  background: "rgba(8,18,40,0.85)",
                  borderLeft: `3px solid ${n.color}`,
                  borderRadius: "8px",
                  padding: "0.6rem 0.9rem",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
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
                      color: "#ffffff",
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
                    color: "rgba(255,255,255,0.6)",
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
          <h2
            className="font-jersey"
            style={{
              fontSize: "clamp(2.2rem, 5vw, 3.75rem)",
              lineHeight: 1.05,
              letterSpacing: "0.02em",
              background: "linear-gradient(135deg, #ffffff 55%, #ff1f71 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Your Matchmaker
          </h2>
          <p
            style={{
              fontSize: "0.95rem",
              color: "rgba(255,255,255,0.80)",
              lineHeight: 1.6,
              maxWidth: "40ch",
              margin: "0 auto",
            }}
          >
            An AI matchmaker that learns exactly what you&apos;re into.
          </p>

          {/* Three feature columns */}
          <div className="cols-3" style={{ marginTop: "3rem" }}>
            {features.map((f) => (
              <div
                key={f.title}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  gap: "0.75rem",
                  minWidth: 0,
                  color: "#ffffff",
                }}
              >
                {f.icon}
                <h3
                  className="font-jersey"
                  style={{
                    fontSize: "1.1rem",
                    letterSpacing: "0.1em",
                    lineHeight: 1.2,
                    color: "#ffffff",
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "rgba(255,255,255,0.75)",
                    lineHeight: 1.65,
                    maxWidth: "20ch",
                  }}
                >
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
