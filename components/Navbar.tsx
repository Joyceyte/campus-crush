"use client";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 60);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function openWaitlist() {
    window.dispatchEvent(new CustomEvent("open-waitlist"));
  }

  return (
    <nav
      className="site-nav fixed top-0 left-0 right-0 z-50 flex items-center justify-between"
      style={{
        paddingTop: scrolled ? "1rem" : "1.5rem",
        paddingBottom: scrolled ? "1rem" : "1.5rem",
        background: scrolled ? "rgba(8,16,30,0.72)" : "transparent",
        backdropFilter: scrolled ? "blur(16px) saturate(160%)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(16px) saturate(160%)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
        transition: "0.3s cubic-bezier(0,0,0.2,1)",
      }}
      aria-label="Site navigation"
    >
      <a href="/" aria-label="Campus Crush home" style={{ display: "block" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-header.png"
          alt="Campus Crush"
          style={{ height: "30px", width: "auto", display: "block" }}
        />
      </a>

      <div className="nav-actions" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <a
          href="https://www.instagram.com/campus_crush_org"
          target="_blank"
          rel="noopener noreferrer"
          className="glass-btn nav-cta"
          style={{ fontSize: "0.72rem", padding: "0.55rem 1.2rem", minHeight: "36px" }}
          aria-label="Campus Crush (@campus_crush_org) on Instagram"
        >
          Instagram
        </a>
        <button
          className="neon-btn nav-cta"
          style={{ fontSize: "0.72rem", padding: "0.55rem 1.2rem", minHeight: "36px" }}
          onClick={openWaitlist}
          aria-label="Join the Campus Crush waitlist"
        >
          <span className="sm:hidden">Join</span>
          <span className="hidden sm:inline">Join Waitlist</span>
        </button>
      </div>
    </nav>
  );
}
