// The brand's actual voice, not a feature pitch: who Campus Crush is for,
// stated plainly before the "how it works" sections dive into mechanics.
// Sits right after Hero so it's one of the first things a visitor reads.
export default function Motto() {
  return (
    <section
      aria-labelledby="motto-heading"
      style={{
        background: "var(--parchment)",
        padding: "2rem 1.25rem 0.5rem",
        textAlign: "center",
      }}
    >
      <div
        className="paper-plate grain"
        style={{
          display: "inline-flex",
          flexDirection: "column",
          gap: "1rem",
          maxWidth: "34rem",
          margin: "0 auto",
        }}
      >
        <h2
          id="motto-heading"
          className="font-jersey"
          style={{
            fontSize: "clamp(2rem, 5vw, 3rem)",
            lineHeight: 1.1,
            letterSpacing: "0.02em",
            color: "var(--terracotta)",
          }}
        >
          Down-to-earth people. Real connection.
        </h2>
        <p
          style={{
            fontSize: "0.95rem",
            color: "rgba(43,27,18,0.8)",
            lineHeight: 1.65,
          }}
        >
          No games, no superficial stuff. Just genuine people who actually
          want to meet someone.
        </p>
      </div>
    </section>
  );
}
