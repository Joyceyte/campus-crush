export default function Footer() {
  return (
    <footer
      style={{
        background: "var(--terracotta)",
        borderTop: "1px solid rgba(247,239,225,0.14)",
        padding: "1.5rem 2rem",
      }}
    >
      <div
        style={{
          maxWidth: "64rem",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <nav aria-label="Footer links">
          <div
            style={{
              display: "flex",
              gap: "1.5rem",
              fontSize: "0.75rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            <a href="/blog" style={{ color: "var(--parchment)", textDecoration: "none" }}>Blog</a>
            <a href="/privacy" style={{ color: "var(--parchment)", textDecoration: "none" }}>Privacy</a>
            <a href="/contact" style={{ color: "var(--parchment)", textDecoration: "none" }}>Contact</a>
            <a
              href="https://www.instagram.com/campus_crush_org"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--parchment)", textDecoration: "none" }}
            >
              Instagram
            </a>
          </div>
        </nav>
      </div>
    </footer>
  );
}
