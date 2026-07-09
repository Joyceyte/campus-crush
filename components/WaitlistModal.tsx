"use client";
import { useEffect, useState } from "react";
import { useSignupCount } from "@/lib/useSignupCount";

type Cohort = "unimelb" | "other";

// Mirrors the accepted domains in app/api/waitlist/route.ts — kept here too
// so the modal can give instant per-cohort feedback before hitting the API.
const EXPANSION_NOTE = "We're working hard to expand to more unis — please be patient with us!";
const COHORT_CONFIG: Record<Cohort, { domains: string[]; placeholder: string; acceptedText: string; errorText: string }> = {
  unimelb: {
    domains: ["@student.unimelb.edu.au"],
    placeholder: "you@student.unimelb.edu.au",
    acceptedText: "Currently open to University of Melbourne students.",
    errorText: `Needs to be a @student.unimelb.edu.au address. ${EXPANSION_NOTE}`,
  },
  other: {
    domains: ["@student.monash.edu", "@deakin.edu.au", "@student.rmit.edu.au"],
    placeholder: "you@student.monash.edu",
    acceptedText: "Currently open to Monash, Deakin, and RMIT students.",
    errorText: `Needs to be a Monash, Deakin, or RMIT student email. ${EXPANSION_NOTE}`,
  },
};

export default function WaitlistModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [cohort, setCohort] = useState<Cohort>("unimelb");
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
    function handleOpen(e: Event) {
      const detail = (e as CustomEvent<{ cohort?: Cohort }>).detail;
      setCohort(detail?.cohort === "other" ? "other" : "unimelb");
      setIsOpen(true);
    }
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
    const { domains, errorText } = COHORT_CONFIG[cohort];
    if (!domains.some((domain) => val.endsWith(domain))) {
      setEmailError(errorText);
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
    background: "var(--parchment)",
    border: "1px solid rgba(43,27,18,0.22)",
    borderRadius: "0.75rem",
    padding: "0.85rem 1rem",
    width: "100%",
    color: "var(--ink)",
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
    color: "rgba(43,27,18,0.55)",
    marginBottom: "0.4rem",
  };

  const consentLabelStyle: React.CSSProperties = {
    display: "flex",
    gap: "0.6rem",
    alignItems: "flex-start",
    fontSize: "0.72rem",
    lineHeight: 1.55,
    color: "rgba(43,27,18,0.66)",
    cursor: "pointer",
  };

  const consentCheckboxStyle: React.CSSProperties = {
    marginTop: "0.15rem",
    width: "1rem",
    height: "1rem",
    flexShrink: 0,
    accentColor: "var(--terracotta)",
    cursor: "pointer",
  };

  const consentLinkStyle: React.CSSProperties = {
    color: "var(--ink)",
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
          background: "rgba(43,27,18,0.35)",
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
          background: "var(--parchment-deep)",
          border: "1px solid rgba(43,27,18,0.16)",
          borderRadius: "1.5rem",
          boxShadow: "0 25px 60px rgba(43,27,18,0.25)",
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
            background: "rgba(43,27,18,0.06)",
            border: "1px solid rgba(43,27,18,0.16)",
            borderRadius: "9999px",
            width: "2rem",
            height: "2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "rgba(43,27,18,0.6)",
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
              style={{ fontSize: "2rem", color: "var(--ink)", letterSpacing: "0.06em", marginBottom: "0.75rem" }}
            >
              You&apos;re in!
            </h2>
            <p style={{ fontSize: "0.85rem", color: "rgba(43,27,18,0.7)", lineHeight: 1.7, maxWidth: "28ch", margin: "0 auto 1.5rem" }}>
              This is your in on Campus Crush. We&apos;re launching once we hit our first{" "}
              <span style={{ color: "var(--terracotta)", fontWeight: 600 }}>100 exclusive members</span>{" "}
              {cohort === "unimelb" ? "at the University of Melbourne." : "at your uni."}
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
                style={{ fontSize: "1.7rem", color: "var(--ink)", letterSpacing: "0.06em", marginBottom: "0.3rem" }}
              >
                Join the Waitlist
              </h2>
              <p style={{ fontSize: "0.95rem", color: "var(--terracotta)", letterSpacing: "0.04em", fontWeight: 600 }}>
                First 100 users get one month of<br />premium FREE
              </p>
            </div>

            {/* Signup count */}
            {signups !== null && (
              <p style={{ textAlign: "center", fontSize: "0.85rem", color: "rgba(43,27,18,0.7)", letterSpacing: "0.02em" }}>
                <span className="font-jersey" style={{ fontSize: "1.15rem", color: "var(--terracotta)", letterSpacing: "0.04em" }}>
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
                  colorScheme: "light",
                  appearance: "none",
                  cursor: "pointer",
                  color: gender ? "var(--ink)" : "rgba(43,27,18,0.45)",
                  borderColor: genderError ? "rgba(193,81,47,0.7)" : "rgba(43,27,18,0.22)",
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%232B1B12' fill-opacity='0.5' d='M6 8L0 0h12z'/%3E%3C/svg%3E\")",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 1rem center",
                }}
              >
                <option value="" disabled style={{ color: "rgba(43,27,18,0.45)", background: "var(--parchment)" }}>Select…</option>
                <option value="male" style={{ color: "var(--ink)", background: "var(--parchment)" }}>Male</option>
                <option value="female" style={{ color: "var(--ink)", background: "var(--parchment)" }}>Female</option>
                <option value="non-binary" style={{ color: "var(--ink)", background: "var(--parchment)" }}>Non-binary</option>
                <option value="other" style={{ color: "var(--ink)", background: "var(--parchment)" }}>Other</option>
              </select>
              {genderError && (
                <p style={{ fontSize: "0.7rem", color: "var(--terracotta)", marginTop: "0.35rem", letterSpacing: "0.02em" }}>
                  {genderError}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="waitlist-email" style={labelStyle}>University email</label>
              <p style={{ fontSize: "0.72rem", color: "rgba(43,27,18,0.6)", marginBottom: "0.5rem", lineHeight: 1.5 }}>
                {COHORT_CONFIG[cohort].acceptedText}
              </p>
              <input
                id="waitlist-email"
                type="email"
                placeholder={COHORT_CONFIG[cohort].placeholder}
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (emailError) validateEmail(e.target.value); }}
                onBlur={(e) => validateEmail(e.target.value)}
                style={{
                  ...inputStyle,
                  borderColor: emailError ? "rgba(193,81,47,0.7)" : "rgba(43,27,18,0.22)",
                }}
              />
              {emailError && (
                <p style={{ fontSize: "0.7rem", color: "var(--terracotta)", marginTop: "0.35rem", letterSpacing: "0.02em" }}>
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
              <p style={{ fontSize: "0.75rem", color: "var(--terracotta)", textAlign: "center" }}>{apiError}</p>
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
