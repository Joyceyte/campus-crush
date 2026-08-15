"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import { joinPilot, type JoinPilotState } from "@/app/actions/join-pilot";

// Opened by dispatching `open-join-pilot` on window, mirroring the existing
// `open-waitlist` pattern so any CTA anywhere can trigger it without prop
// drilling through the page.
export default function JoinPilotModal() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<JoinPilotState, FormData>(
    joinPilot,
    {}
  );
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("open-join-pilot", onOpen);
    return () => window.removeEventListener("open-join-pilot", onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    firstFieldRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(43,27,18,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.25rem",
        overflowY: "auto",
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="join-pilot-heading"
        style={{
          background: "var(--parchment, #F7EFE1)",
          border: "1px solid rgba(43,27,18,0.16)",
          borderRadius: "20px",
          boxShadow: "0 25px 60px rgba(43,27,18,0.35)",
          maxWidth: "27rem",
          width: "100%",
          padding: "2rem 1.75rem",
        }}
      >
        <h2
          id="join-pilot-heading"
          className="font-jersey"
          style={{
            fontSize: "2rem",
            lineHeight: 1.1,
            color: "var(--ink, #2B1B12)",
            margin: "0 0 0.35rem",
          }}
        >
          join the pilot
        </h2>
        <p
          style={{
            fontSize: "0.85rem",
            lineHeight: 1.6,
            color: "rgba(43,27,18,0.7)",
            margin: "0 0 1.5rem",
          }}
        >
          Semester 2, 2026 · UniMelb · $5 to secure your spot. Signups close 20
          August.
        </p>

        <form action={formAction} style={{ display: "grid", gap: "1rem" }}>
          <Field label="Full name">
            <input
              ref={firstFieldRef}
              name="full_name"
              type="text"
              required
              autoComplete="name"
              style={inputStyle}
            />
          </Field>

          <Field label="University email">
            <input
              name="email"
              type="email"
              required
              placeholder="you@student.unimelb.edu.au"
              autoComplete="email"
              style={inputStyle}
            />
          </Field>

          <Field label="Phone number" hint="We'll text you once, when we launch.">
            <input
              name="phone"
              type="tel"
              required
              placeholder="0412 345 678"
              autoComplete="tel"
              style={inputStyle}
            />
          </Field>

          <label
            style={{
              display: "flex",
              gap: "0.6rem",
              alignItems: "flex-start",
              fontSize: "0.8rem",
              lineHeight: 1.5,
              color: "rgba(43,27,18,0.8)",
              cursor: "pointer",
            }}
          >
            <input
              name="over_18"
              type="checkbox"
              required
              style={{ marginTop: "0.2rem" }}
            />
            <span>I confirm I am over the age of 18</span>
          </label>

          {state.error && (
            <p
              role="alert"
              style={{
                margin: 0,
                fontSize: "0.8rem",
                lineHeight: 1.5,
                color: "var(--terracotta-deep, #A03E22)",
                background: "rgba(193,81,47,0.1)",
                border: "1px solid rgba(193,81,47,0.25)",
                borderRadius: "10px",
                padding: "0.6rem 0.75rem",
              }}
            >
              {state.error}
            </p>
          )}

          <button type="submit" className="neon-btn" disabled={pending}>
            {pending ? "Taking you to checkout…" : "Continue to payment →"}
          </button>

          <p
            style={{
              margin: 0,
              fontSize: "0.7rem",
              lineHeight: 1.5,
              color: "rgba(43,27,18,0.55)",
              textAlign: "center",
            }}
          >
            Payment is handled by Square. Your card details never touch our site.
          </p>
        </form>

        <button
          type="button"
          onClick={() => setOpen(false)}
          style={{
            marginTop: "1rem",
            width: "100%",
            background: "none",
            border: "none",
            fontSize: "0.78rem",
            color: "rgba(43,27,18,0.55)",
            textDecoration: "underline",
            cursor: "pointer",
          }}
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.65rem 0.75rem",
  borderRadius: "10px",
  border: "1px solid rgba(43,27,18,0.22)",
  background: "rgba(255,255,255,0.6)",
  color: "var(--ink, #2B1B12)",
  fontSize: "0.9rem",
};

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "block" }}>
      <span
        style={{
          display: "block",
          fontSize: "0.72rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          fontWeight: 700,
          color: "rgba(43,27,18,0.75)",
          marginBottom: "0.35rem",
        }}
      >
        {label}
      </span>
      {children}
      {hint && (
        <span
          style={{
            display: "block",
            fontSize: "0.7rem",
            color: "rgba(43,27,18,0.55)",
            marginTop: "0.3rem",
          }}
        >
          {hint}
        </span>
      )}
    </label>
  );
}
