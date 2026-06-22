const features = [
  {
    emoji: "🧠",
    title: "Learns your type",
    desc: "Not just your likes — your patterns. The more you go on dates, the smarter it gets.",
  },
  {
    emoji: "🎯",
    title: "Scans the whole pool",
    desc: "We match across your entire campus, not just who swiped right.",
  },
  {
    emoji: "✨",
    title: "Gets better every date",
    desc: "Each date teaches Campus Crush more about what actually works for you.",
  },
];

export default function Matchmaker() {
  return (
    <section
      aria-labelledby="matchmaker-heading"
      className="section-pad"
      style={{ position: "relative", overflow: "hidden", background: "var(--navy-dark)" }}
    >
      {/* Blurred background photo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/beachdate.jpeg"
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
          <p className="section-label">YOUR MATCHMAKER</p>
          <h2
            id="matchmaker-heading"
            className="font-jersey"
            style={{
              fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
              color: "#ffffff",
              lineHeight: 1.05,
              letterSpacing: "0.04em",
            }}
          >
            Your Personalized Matchmaker
          </h2>
          <p
            style={{
              fontSize: "0.95rem",
              color: "rgba(255,255,255,0.80)",
              lineHeight: 1.65,
              maxWidth: "46ch",
            }}
          >
            Backed by the best psychology research. Campus Crush learns your preferences and scans the entire campus pool to find the one.
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
                }}
              >
                <span style={{ fontSize: "1.75rem" }} aria-hidden="true">{f.emoji}</span>
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
