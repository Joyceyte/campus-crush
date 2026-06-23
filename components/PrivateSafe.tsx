const pillars = [
  {
    icon: (
      <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f393.png" width="40" height="40" alt="" aria-hidden="true" />
    ),
    title: "Verified students only",
    desc: "University of Melbourne students only. Every profile is verified with your student email.",
  },
  {
    icon: (
      <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f512.png" width="40" height="40" alt="" aria-hidden="true" />
    ),
    title: "Only your date sees you",
    desc: "No public profile. No strangers. Just the person we matched you with.",
  },
  {
    icon: (
      <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/2615.png" width="40" height="40" alt="" aria-hidden="true" />
    ),
    title: "Date on campus",
    desc: "Every first date is a casual campus coffee — familiar, safe, and zero pressure.",
  },
];

export default function PrivateSafe() {
  return (
    <section
      id="private-safe"
      aria-labelledby="private-safe-heading"
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
        src="/park-date.jpeg"
        alt=""
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "blur(3px)", transform: "scale(1.06)", opacity: 1 }}
      />
      {/* Single scrim for text legibility */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(6,12,22,0.55) 0%, rgba(6,12,22,0.72) 100%)" }} />

      {/* Content */}
      <div className="section-pad relative" style={{ zIndex: 5 }}>
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
            id="private-safe-heading"
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
            Private &amp; Safe
          </h2>

          {/* Three feature columns */}
          <div className="cols-3" style={{ marginTop: "1rem" }}>
            {pillars.map((p) => (
              <div
                key={p.title}
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
                {p.icon}
                <h3
                  className="font-jersey"
                  style={{
                    fontSize: "1.1rem",
                    letterSpacing: "0.1em",
                    lineHeight: 1.2,
                    color: "#ffffff",
                  }}
                >
                  {p.title}
                </h3>
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "rgba(255,255,255,0.75)",
                    lineHeight: 1.65,
                    maxWidth: "20ch",
                  }}
                >
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
