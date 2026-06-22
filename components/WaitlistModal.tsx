"use client";
import { useEffect, useState, useCallback } from "react";

const LAUNCH_TARGET = new Date("2026-06-29T00:00:00+10:00");

function useCountdown(target: Date) {
  const calc = useCallback(() => Math.max(0, target.getTime() - Date.now()), [target]);
  const [ms, setMs] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setMs(calc()), 1000);
    return () => clearInterval(id);
  }, [calc]);
  return {
    d: Math.floor(ms / 86400000),
    h: Math.floor((ms % 86400000) / 3600000),
    m: Math.floor((ms % 3600000) / 60000),
    s: Math.floor((ms % 60000) / 1000),
  };
}

export default function WaitlistModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState("");
  const { d, h, m, s } = useCountdown(LAUNCH_TARGET);

  useEffect(() => {
    function handleOpen() { setIsOpen(true); }
    window.addEventListener("open-waitlist", handleOpen);
    return () => window.removeEventListener("open-waitlist", handleOpen);
  }, []);

  function onClose() {
    setIsOpen(false);
    setTimeout(() => {
      setSuccess(false);
      setName("");
      setEmail("");
      setEmailError("");
      setApiError("");
    }, 300);
  }

  function validateEmail(val: string) {
    if (!val.endsWith("@student.unimelb.edu.au")) {
      setEmailError("Needs to be a @student.unimelb.edu.au address");
      return false;
    }
    setEmailError("");
    return true;
  }

  async function handleSubmit() {
    setApiError("");
    if (!name.trim()) return;
    if (!validateEmail(email)) return;
    setLoading(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setApiError(data.error || "Something went wrong.");
      }
    } catch {
      setApiError("Network error — try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: "0.75rem",
    padding: "0.85rem 1rem",
    width: "100%",
    color: "white",
    fontSize: "0.9rem",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "Helvetica, Arial, sans-serif",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.65rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.50)",
    marginBottom: "0.4rem",
  };

  return (
    <>
      {/* Blurred overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          zIndex: 200,
        }}
        aria-hidden="true"
      />

      {/* Modal card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="waitlist-modal-heading"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 201,
          background: "#0f2044",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: "1.5rem",
          boxShadow: "0 25px 60px rgba(0,0,0,0.55)",
          width: "min(440px, calc(100vw - 2rem))",
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.1rem",
        }}
      >
        {/* X close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: "1.1rem",
            right: "1.1rem",
            background: "rgba(255,255,255,0.10)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "9999px",
            width: "2rem",
            height: "2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "rgba(255,255,255,0.6)",
            fontSize: "1rem",
            lineHeight: 1,
          }}
        >
          ✕
        </button>

        {success ? (
          /* ── Success state ── */
          <div style={{ textAlign: "center", padding: "1rem 0" }}>
            <p style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🎉</p>
            <h2
              className="font-jersey"
              style={{ fontSize: "2rem", color: "#ffffff", letterSpacing: "0.06em", marginBottom: "0.75rem" }}
            >
              You&apos;re in!
            </h2>
            <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.70)", lineHeight: 1.7, maxWidth: "28ch", margin: "0 auto 1.5rem" }}>
              This is your in on Campus Crush. We&apos;re launching once we hit our first{" "}
              <span style={{ color: "#ff1f71", fontWeight: 600 }}>100 exclusive members</span>{" "}
              at the University of Melbourne.
            </p>
            <button className="neon-btn" onClick={onClose} style={{ fontSize: "0.8rem" }}>
              Done
            </button>
          </div>
        ) : (
          /* ── Form state ── */
          <>
            {/* Header */}
            <div style={{ textAlign: "center", paddingRight: "1.5rem" }}>
              <h2
                id="waitlist-modal-heading"
                className="font-jersey"
                style={{ fontSize: "1.7rem", color: "#ffffff", letterSpacing: "0.06em", marginBottom: "0.3rem" }}
              >
                Join the Waitlist
              </h2>
              <p style={{ fontSize: "0.75rem", color: "#ff1f71", letterSpacing: "0.04em", fontWeight: 600 }}>
                First 100 users get a free lifetime membership
              </p>
            </div>

            {/* Countdown */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "0.5rem",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: "0.9rem",
                padding: "0.85rem 0.75rem",
              }}
            >
              {[
                { val: d, label: "days" },
                { val: h, label: "hrs" },
                { val: m, label: "min" },
                { val: s, label: "sec" },
              ].map(({ val, label }) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <div
                    className="font-jersey"
                    style={{ fontSize: "1.6rem", color: "#ff1f71", lineHeight: 1, letterSpacing: "0.04em",
                      textShadow: "0 0 12px rgba(255,31,113,0.5)" }}
                  >
                    {String(val).padStart(2, "0")}
                  </div>
                  <div style={{ fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase",
                    color: "rgba(255,255,255,0.40)", marginTop: "0.2rem" }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>

            {/* Name */}
            <div>
              <label htmlFor="waitlist-name" style={labelStyle}>Your name</label>
              <input
                id="waitlist-name"
                type="text"
                placeholder="First name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="waitlist-email" style={labelStyle}>University email</label>
              <input
                id="waitlist-email"
                type="email"
                placeholder="you@student.unimelb.edu.au"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (emailError) validateEmail(e.target.value); }}
                onBlur={(e) => validateEmail(e.target.value)}
                style={{
                  ...inputStyle,
                  borderColor: emailError ? "rgba(255,31,113,0.7)" : "rgba(255,255,255,0.18)",
                }}
              />
              {emailError && (
                <p style={{ fontSize: "0.7rem", color: "#ff1f71", marginTop: "0.35rem", letterSpacing: "0.02em" }}>
                  {emailError}
                </p>
              )}
            </div>

            {/* API error */}
            {apiError && (
              <p style={{ fontSize: "0.75rem", color: "#ff1f71", textAlign: "center" }}>{apiError}</p>
            )}

            {/* Submit */}
            <button
              className="neon-btn"
              style={{ width: "100%", justifyContent: "center", opacity: loading ? 0.7 : 1 }}
              type="button"
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading ? "Joining…" : "Join the Waitlist →"}
            </button>
          </>
        )}
      </div>
    </>
  );
}
