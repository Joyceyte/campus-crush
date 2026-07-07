export default function Footer() {
  return (
    <footer
      style={{
        background: "var(--burgundy)",
        borderTop: "1px solid rgba(247,239,225,0.14)",
        padding: "0.25rem 2rem",
      }}
    >
      <div
        style={{
          maxWidth: "64rem",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-footer.png"
          alt="Campus Crush"
          style={{ height: "170px", width: "auto", display: "block", margin: "-1rem 0" }}
        />
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
            <a href="/blog" style={{ color: "rgba(247,239,225,0.75)", textDecoration: "none" }}>Blog</a>
            <a href="/privacy" style={{ color: "rgba(247,239,225,0.75)", textDecoration: "none" }}>Privacy</a>
            <a href="/contact" style={{ color: "rgba(247,239,225,0.75)", textDecoration: "none" }}>Contact</a>
            <a
              href="https://www.instagram.com/campus_crush_org"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "rgba(247,239,225,0.75)", textDecoration: "none" }}
            >
              Instagram
            </a>
          </div>
        </nav>
      </div>
    </footer>
  );
}
