const pillars = [
  {
    icon: (
      <img src="/twemoji/1f393.png" width="40" height="40" alt="" aria-hidden="true" />
    ),
    title: "Verified students only",
    desc: "University students only. Every profile is verified with your student email.",
  },
  {
    icon: (
      <img src="/twemoji/1f512.png" width="40" height="40" alt="" aria-hidden="true" />
    ),
    title: "Only your date sees you",
    desc: "No public profile. No strangers. Just the person we matched you with.",
  },
  {
    icon: (
      <img src="/twemoji/2615.png" width="40" height="40" alt="" aria-hidden="true" />
    ),
    title: "Public, low-key dates",
    desc: "Every first date is somewhere public and relaxed: a cafe, a gallery, or a walk, planned for you. Familiar, safe, zero pressure.",
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
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        paddingTop: "3rem",
        paddingBottom: "3rem",
      }}
    >
      {/* Full-bleed blurred photo backdrop */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/park-date.jpeg"
        alt=""
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.72) brightness(1.1) contrast(0.9) sepia(0.14)", transform: "scale(1.06)", opacity: 1 }}
      />
      {/* Light warmth glaze — text contrast now comes from the paper-plate cards, not this scrim */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(247,239,225,0.15) 0%, rgba(247,239,225,0.3) 100%)" }} />

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
            className="font-jersey paper-plate grain"
            style={{
              fontSize: "clamp(2.2rem, 5vw, 3.75rem)",
              lineHeight: 1.05,
              letterSpacing: "0.02em",
              color: "var(--terracotta)",
              display: "inline-block",
            }}
          >
            Private &amp; Safe
          </h2>

          {/* Three feature columns — each its own small paper plate */}
          <div className="cols-3" style={{ marginTop: "1rem" }}>
            {pillars.map((p, i) => (
              <div
                key={p.title}
                className="paper-plate grain"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  gap: "0.75rem",
                  minWidth: 0,
                  color: "var(--ink)",
                  padding: "1.75rem 1.25rem 1.75rem 1.75rem",
                  transform: `rotate(${i === 1 ? 0 : i === 0 ? -1 : 1}deg)`,
                }}
              >
                {p.icon}
                <h3
                  className="font-jersey"
                  style={{
                    fontSize: "1.1rem",
                    letterSpacing: "0.1em",
                    lineHeight: 1.2,
                    color: "var(--ink)",
                  }}
                >
                  {p.title}
                </h3>
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "rgba(43,27,18,0.75)",
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
