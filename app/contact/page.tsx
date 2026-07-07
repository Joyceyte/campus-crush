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
          background: "var(--navy-dark)",
          paddingTop: "8rem",
          paddingBottom: "5rem",
          minHeight: "60vh",
        }}
      >
        <div style={{ maxWidth: "42rem", margin: "0 auto", padding: "0 1.5rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "1rem", color: "#fff" }}>Contact us</h1>
          <p style={{ marginBottom: "1.5rem", color: "rgba(255,255,255,0.75)", fontSize: "0.95rem" }}>
            Questions, feedback, or need a hand? Reach out any time.
          </p>
          <a
            href="mailto:support@campus-crush.org"
            style={{ fontSize: "1.15rem", color: "#fff", textDecoration: "underline" }}
          >
            support@campus-crush.org
          </a>
        </div>
      </main>
      <Footer />
    </>
  );
}
