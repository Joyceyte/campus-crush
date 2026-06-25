export default function Footer() {
  return (
    <footer
      style={{
        background: "var(--navy-dark)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
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
            <a href="#" style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>Privacy</a>
            <a href="#" style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>Terms</a>
            <a href="#" style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>Contact</a>
            <a href="#" style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>Instagram</a>
          </div>
        </nav>
      </div>
    </footer>
  );
}
