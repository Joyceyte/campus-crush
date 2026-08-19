import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Contact — Campus Crush",
  description: "Get in touch with the Campus Crush team.",
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main
        id="main-content"
        style={{
          background: "var(--parchment)",
          paddingTop: "8rem",
          paddingBottom: "5rem",
          flex: "1 0 auto",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div style={{ maxWidth: "42rem", margin: "0 auto", padding: "0 1.5rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "1rem", color: "var(--ink)" }}>Contact us</h1>
          <p style={{ marginBottom: "1.5rem", color: "rgba(43,27,18,0.75)", fontSize: "0.95rem" }}>
            Questions, feedback, or need a hand? Reach out any time.
          </p>
          <a
            href="mailto:support@campus-crush.org"
            style={{ fontSize: "1.15rem", color: "var(--ink)", textDecoration: "underline" }}
          >
            support@campus-crush.org
          </a>

          <p style={{ margin: "2rem 0 1rem", color: "rgba(43,27,18,0.75)", fontSize: "0.95rem" }}>
            Or DM us on Instagram!
          </p>
          <a
            href="https://www.instagram.com/campuscrush_uni/"
            target="_blank"
            rel="noopener noreferrer"
            className="glass-btn"
            aria-label="Campus Crush (@campuscrush_uni) on Instagram"
          >
            Follow @campuscrush_uni
          </a>
        </div>
      </main>
      <Footer />
    </>
  );
}
