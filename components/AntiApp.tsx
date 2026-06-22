const notifications = [
  { emoji: "🔥", app: "Tinder", text: "You have 14 new likes", color: "#FF4458", top: 0, left: 20, rotate: -3 },
  { emoji: "💬", app: "Hinge", text: "Someone commented on your prompt", color: "#9933CC", top: 40, left: 0, rotate: 2 },
  { emoji: "🔥", app: "Tinder", text: "Your match expired!", color: "#FF4458", top: 80, left: 30, rotate: -1 },
  { emoji: "💬", app: "Hinge", text: "She's popular — send something unique", color: "#9933CC", top: 120, left: 10, rotate: 3 },
  { emoji: "🔥", app: "Tinder", text: "Boost now to get 10x more matches", color: "#FF4458", top: 160, left: 40, rotate: -2 },
  { emoji: "💬", app: "Hinge", text: "Rose sent!", color: "#9933CC", top: 200, left: 5, rotate: 1 },
];

export default function AntiApp() {
  return (
    <section
      aria-labelledby="anti-app-heading"
      className="section-pad"
      style={{
        position: "relative",
        overflow: "hidden",
        background: "var(--navy-dark)",
      }}
    >
      {/* Blurred background photo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/bar-date.jpeg"
        alt=""
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "blur(40px)",
          transform: "scale(1.15)",
          opacity: 0.35,
        }}
      />
      {/* Dark navy overlay */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(8,18,40,0.82)" }} aria-hidden="true" />

      {/* Content */}
      <div className="relative" style={{ zIndex: 1 }}>
        <div className="cols-2" style={{ maxWidth: "64rem", gap: "4rem" }}>
          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", textAlign: "center" }}>
            <p className="section-label">BUILT DIFFERENT</p>
            <h2
              id="anti-app-heading"
              className="font-jersey"
              style={{
                fontSize: "clamp(2.2rem, 5vw, 3.75rem)",
                color: "#ffffff",
                lineHeight: 1.05,
                letterSpacing: "0.04em",
              }}
            >
              Tired of Tinder and Hinge?
            </h2>
            <p
              style={{
                fontSize: "0.95rem",
                color: "rgba(255,255,255,0.80)",
                lineHeight: 1.65,
                maxWidth: "34ch",
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
    </section>
  );
}
