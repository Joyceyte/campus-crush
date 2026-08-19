import InstagramEmbed from "@/components/InstagramEmbed";

// Deliberately compact (not the usual min-height:92vh section treatment) and
// placed right after Hero, so a visitor sees it with barely a scroll instead
// of it competing with the full-viewport sections further down the page.
export default function InstagramShowcase() {
  return (
    <section
      aria-labelledby="instagram-showcase-heading"
      style={{
        background: "var(--parchment)",
        padding: "2.5rem 1.25rem",
        textAlign: "center",
      }}
    >
      <p className="section-label">FROM OUR INSTAGRAM</p>
      <h2
        id="instagram-showcase-heading"
        className="font-jersey"
        style={{
          fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
          letterSpacing: "0.02em",
          color: "var(--terracotta)",
          marginBottom: "2rem",
        }}
      > Follow us to see more!
      </h2>
      <InstagramEmbed url="https://www.instagram.com/reel/DcNrrIlhsH_/" />
    </section>
  );
}
