"use client";
import { useEffect, useRef, useState } from "react";

// First-visit letter from Alex and Joyce. Shown once per browser, then never
// again — a returning visitor who's already read it just gets the page.
//
// Deliberately styled as a torn page taped into the scrapbook rather than a
// generic dialog: it's a letter, and the whole point is that it reads as
// personal.
const SEEN_KEY = "cc-founders-note-seen";
const OPEN_DELAY_MS = 1200; // let the hero land first

export default function FoundersNote() {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<Element | null>(null);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(SEEN_KEY);
    } catch {
      // Private browsing or storage disabled — show it and move on rather
      // than breaking the page over a nice-to-have.
    }
    if (stored) return;

    const timeout = setTimeout(() => setOpen(true), OPEN_DELAY_MS);
    return () => clearTimeout(timeout);
  }, []);

  function dismiss() {
    setOpen(false);
    try {
      window.localStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* see above */
    }
    (previouslyFocused.current as HTMLElement | null)?.focus?.();
  }

  function signUp() {
    dismiss();
    window.dispatchEvent(new CustomEvent("open-join-pilot"));
  }

  function joinWaitlist() {
    dismiss();
    window.dispatchEvent(new CustomEvent("open-waitlist"));
  }

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) dismiss();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 110,
        background: "rgba(43,27,18,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem 1.25rem",
        overflowY: "auto",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="founders-note-heading"
        className="scrap-wrap"
        style={{ maxWidth: "27rem", width: "100%", transform: "rotate(-1.2deg)" }}
      >
        <div
          aria-hidden="true"
          className="washi"
          style={{ transform: "translateX(-50%) rotate(-4deg)" }}
        />
        <div className="scrap-card scrap-card--ruled" style={{ gap: "0.9rem" }}>
          <p
            id="founders-note-heading"
            style={{
              fontSize: "0.68rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              fontWeight: 700,
              color: "rgba(43,27,18,0.55)",
              margin: 0,
            }}
          >
            a message from the founders
          </p>

          <p
            style={{
              margin: 0,
              fontSize: "0.95rem",
              lineHeight: 1.75,
              color: "rgba(43,27,18,0.82)",
              textAlign: "left",
              alignSelf: "stretch",
            }}
          >
            Hey students,
          </p>
          <p
            style={{
              margin: 0,
              fontSize: "0.95rem",
              lineHeight: 1.75,
              color: "rgba(43,27,18,0.82)",
              textAlign: "left",
              alignSelf: "stretch",
            }}
          >
            This is <strong style={{ color: "var(--ink)" }}>Alex and Joyce</strong> and
            we are so excited to announce that signups for the semester 2 pilot
            trial is officially open! 
          </p>
          <p
            style={{
              margin: 0,
              fontSize: "0.95rem",
              lineHeight: 1.75,
              color: "rgba(43,27,18,0.82)",
              textAlign: "left",
              alignSelf: "stretch",
            }}
          >
            Campus Crush is open to all sexualities and gender identities, and
            to any uni student, whether you&rsquo;re doing undergrad, masters,
            or PhD.
          </p>

          <p
            style={{
              margin: "0.2rem 0 0",
              fontSize: "0.78rem",
              letterSpacing: "0.04em",
              color: "rgba(43,27,18,0.6)",
            }}
          >
            100 spots &middot; UniMelb &middot; closes 20 August
          </p>

          <button type="button" className="neon-btn" onClick={signUp}>
            Sign up →
          </button>

          <button
            ref={closeRef}
            type="button"
            onClick={dismiss}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              fontSize: "0.75rem",
              color: "rgba(43,27,18,0.55)",
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            Read the site first
          </button>

          <button
            type="button"
            onClick={joinWaitlist}
            style={{
              marginTop: "0.1rem",
              background: "none",
              border: "none",
              padding: 0,
              textAlign: "left",
              fontSize: "0.72rem",
              lineHeight: 1.6,
              color: "rgba(43,27,18,0.55)",
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            Not a UniMelb student? Join our waitlist, we&rsquo;ll let you know
            when we launch at your uni after the UniMelb pilot.
          </button>
        </div>
      </div>
    </div>
  );
}
