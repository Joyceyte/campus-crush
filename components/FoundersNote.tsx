"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { recordFoundersNoteDismissal, shouldShowFoundersNote } from "@/lib/founders-note";

// First-visit letter from Alex and Joyce. Shown once per browser; if someone
// closes it without signing up, it comes back after
// FOUNDERS_NOTE_SNOOZE_DAYS in case they missed it or weren't ready yet.
// Anyone who actually joins the waitlist or the pilot never sees it again
// (see lib/founders-note.ts).
//
// Deliberately styled as a torn page taped into the scrapbook rather than a
// generic dialog: it's a letter, and the whole point is that it reads as
// personal.
const OPEN_DELAY_MS = 400; // let the hero land first

export default function FoundersNote() {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<Element | null>(null);

  useEffect(() => {
    if (!shouldShowFoundersNote()) return;
    const timeout = setTimeout(() => setOpen(true), OPEN_DELAY_MS);
    return () => clearTimeout(timeout);
  }, []);

  function dismiss() {
    setOpen(false);
    recordFoundersNoteDismissal();
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
            we are so excited to announce that signups for the Unimelb semester 2 pilot
            trial are officially open! 
          </p>
          <p
            style={{
              margin: 0,
              fontSize: "0.82rem",
              lineHeight: 1.6,
              color: "rgba(43,27,18,0.82)",
              textAlign: "left",
              alignSelf: "stretch",
            }}
          >
            Campus Crush is open to all sexualities and gender identities, and
            to any uni student, whether you&rsquo;re doing undergrad, masters,
            or PhD.
          </p>
          <Link
            href="/blog/what-is-the-pilot"
            onClick={dismiss}
            style={{ fontSize: "0.95rem", color: "var(--terracotta)", textDecoration: "underline" }}
          >
            What is the pilot? →
          </Link>

          <button type="button" className="neon-btn" onClick={signUp}>
            Join UniMelb pilot →
          </button>

          <p
            style={{
              margin: "-0.6rem 0 0",
              fontSize: "0.78rem",
              letterSpacing: "0.04em",
              color: "rgba(43,27,18,0.6)",
            }}
          >
            Closing soon
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
            <strong style={{ color: "var(--ink)" }}>Not at UniMelb?</strong>{" "}
            <button
              type="button"
              onClick={joinWaitlist}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                margin: 0,
                font: "inherit",
                color: "var(--terracotta)",
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              Join our waitlist
            </button>{" "}
            and we&rsquo;ll let you know the moment we launch at your uni.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", alignItems: "flex-start", alignSelf: "stretch" }}>
            <p style={{ margin: 0, fontSize: "0.95rem", color: "rgba(43,27,18,0.55)" }}>
              <strong style={{ color: "var(--ink)" }}>Not sure what campus crush is yet?</strong>
            </p>
            <button
              ref={closeRef}
              type="button"
              onClick={dismiss}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                fontSize: "0.95rem",
                color: "rgba(43,27,18,0.55)",
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              Read the site first
            </button>
            <p style={{ margin: 0, fontSize: "0.95rem", color: "rgba(43,27,18,0.55)" }}>
              Or check out our{" "}
              <a
                href="https://www.instagram.com/campuscrush_uni/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--terracotta)" }}
              >
                Instagram
              </a>{" "}
              and{" "}
              <a
                href="https://www.tiktok.com/@campus_crush.org"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--terracotta)" }}
              >
                TikTok
              </a>{" "}
              for more info!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
