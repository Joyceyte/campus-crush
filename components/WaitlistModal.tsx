"use client";
import { useEffect, useState } from "react";
import { useSignupCount } from "@/lib/useSignupCount";

export default function WaitlistModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [genderError, setGenderError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [consentChecked, setConsentChecked] = useState(false);
  const [ageChecked, setAgeChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState("");
  const signups = useSignupCount();

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
      setGender("");
      setGenderError("");
      setEmailError("");
      setApiError("");
      setConsentChecked(false);
      setAgeChecked(false);
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
    if (!gender) {
      setGenderError("Please select an option");
      return;
    }
    if (!validateEmail(email)) return;
    if (!consentChecked || !ageChecked) return;
    setLoading(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, gender }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setApiError(data.error || "Something went wrong.");
      }
    } catch {
      setApiError("Network error. Try again.");
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

  const consentLabelStyle: React.CSSProperties = {
    display: "flex",
    gap: "0.6rem",
    alignItems: "flex-start",
    fontSize: "0.72rem",
    lineHeight: 1.55,
    color: "rgba(255,255,255,0.60)",
    cursor: "pointer",
  };

  const consentCheckboxStyle: React.CSSProperties = {
    marginTop: "0.15rem",
    width: "1rem",
    height: "1rem",
    flexShrink: 0,
    accentColor: "#ff1f71",
    cursor: "pointer",
  };

  const consentLinkStyle: React.CSSProperties = {
    color: "#ffffff",
    textDecoration: "underline",
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
              <p style={{ fontSize: "0.95rem", color: "#ff1f71", letterSpacing: "0.04em", fontWeight: 600 }}>
                First 100 users get one month of<br />premium FREE
              </p>
            </div>

            {/* Signup count */}
            {signups !== null && (
              <p style={{ textAlign: "center", fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", letterSpacing: "0.02em" }}>
                <span className="font-jersey" style={{ fontSize: "1.15rem", color: "#ff1f71", letterSpacing: "0.04em",
                  textShadow: "0 0 12px rgba(255,31,113,0.5)" }}>
                  {signups}
                </span>{" "}
                campus singles already joined
              </p>
            )}

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

            {/* Gender */}
            <div>
              <label htmlFor="waitlist-gender" style={labelStyle}>Gender</label>
              <select
                id="waitlist-gender"
                value={gender}
                onChange={(e) => { setGender(e.target.value); if (genderError) setGenderError(""); }}
                style={{
                  ...inputStyle,
                  colorScheme: "dark",
                  appearance: "none",
                  cursor: "pointer",
                  color: gender ? "white" : "rgba(255,255,255,0.45)",
                  borderColor: genderError ? "rgba(255,31,113,0.7)" : "rgba(255,255,255,0.18)",
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23ffffff' fill-opacity='0.5' d='M6 8L0 0h12z'/%3E%3C/svg%3E\")",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 1rem center",
                }}
              >
                <option value="" disabled style={{ color: "rgba(255,255,255,0.45)", background: "#0f2044" }}>Select…</option>
                <option value="male" style={{ color: "white", background: "#0f2044" }}>Male</option>
                <option value="female" style={{ color: "white", background: "#0f2044" }}>Female</option>
                <option value="non-binary" style={{ color: "white", background: "#0f2044" }}>Non-binary</option>
                <option value="other" style={{ color: "white", background: "#0f2044" }}>Other</option>
              </select>
              {genderError && (
                <p style={{ fontSize: "0.7rem", color: "#ff1f71", marginTop: "0.35rem", letterSpacing: "0.02em" }}>
                  {genderError}
                </p>
              )}
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

            {/* Consent checkboxes */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <label style={consentLabelStyle}>
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  style={consentCheckboxStyle}
                />
                <span>
                  I consent to Campus Crush collecting and storing my personal information — including my{" "}
                  <strong>name</strong> and <strong>email address</strong> — to contact me about my match, and
                  understand anonymised data may be used for marketing purposes. This information is held in
                  accordance with the Privacy Act 1988 (Cth) and our{" "}
                  <a href="/privacy" target="_blank" rel="noopener noreferrer" style={consentLinkStyle}>
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>
              <label style={consentLabelStyle}>
                <input
                  type="checkbox"
                  checked={ageChecked}
                  onChange={(e) => setAgeChecked(e.target.checked)}
                  style={consentCheckboxStyle}
                />
                <span>I confirm that I am 18 years of age or older.</span>
              </label>
            </div>

            {/* API error */}
            {apiError && (
              <p style={{ fontSize: "0.75rem", color: "#ff1f71", textAlign: "center" }}>{apiError}</p>
            )}

            {/* Submit */}
            <button
              className="neon-btn"
              style={{
                width: "100%",
                justifyContent: "center",
                opacity: loading || !consentChecked || !ageChecked ? 0.5 : 1,
                cursor: loading || !consentChecked || !ageChecked ? "not-allowed" : "pointer",
              }}
              type="button"
              disabled={loading || !consentChecked || !ageChecked}
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
