"use client";
import { Suspense, useActionState, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { joinPilot, type JoinPilotState } from "@/app/actions/join-pilot";

// Lets a link (e.g. an email CTA, or a link on another page) open the popup
// directly via ?open=join-pilot, instead of only ever being reachable by
// clicking a button. Split into its own component, wrapped in Suspense
// below, because useSearchParams() requires that; it's what makes this fire
// on an in-app client-side navigation too, not just a fresh page load —
// JoinPilotModal lives in the root layout and never unmounts between pages,
// so a plain "read window.location.search once on mount" effect would only
// ever catch the very first page load of a session.
function OpenFromQueryParam({ onOpen }: { onOpen: () => void }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("open") !== "join-pilot") return;
    onOpen();
    // Strips the param afterward so a refresh or back-nav doesn't reopen it
    // and the URL stays clean if someone shares it.
    const url = new URL(window.location.href);
    url.searchParams.delete("open");
    window.history.replaceState(null, "", url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return null;
}

// Opened by dispatching `open-join-pilot` on window, mirroring the existing
// `open-waitlist` pattern so any CTA anywhere can trigger it without prop
// drilling through the page.
export default function JoinPilotModal() {
  const [open, setOpen] = useState(false);
  const [wantsFriend, setWantsFriend] = useState(false);
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

  if (!open) {
    return (
      <Suspense fallback={null}>
        <OpenFromQueryParam onOpen={() => setOpen(true)} />
      </Suspense>
    );
  }

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
          padding: "1.5rem 1.75rem",
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
            margin: "0 0 0.9rem",
          }}
        >
          Semester 2, 2026 · UniMelb · $5 to secure your spot. Signups
          closing soon.
        </p>

        <Link
          href="/blog/what-is-the-pilot"
          onClick={() => setOpen(false)}
          style={{
            display: "inline-block",
            fontSize: "0.85rem",
            fontWeight: 700,
            color: "var(--terracotta, #C1512F)",
            textDecoration: "underline",
            margin: "0 0 0.9rem",
          }}
        >
          What is the pilot? →
        </Link>

        <form action={formAction} style={{ display: "grid", gap: "0.75rem" }}>
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

          <Field label="Phone number" hint="We'll notify you once, when we launch.">
            <input
              name="phone"
              type="tel"
              required
              placeholder="0412 345 678"
              autoComplete="tel"
              style={inputStyle}
            />
          </Field>

          <SelectWithOther
            name="gender"
            label="Gender"
            options={[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
              { value: "non-binary", label: "Non-binary" },
              { value: "other", label: "Other" },
            ]}
            required
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <Field label="Age">
              <input
                name="age"
                type="number"
                required
                min={18}
                max={100}
                placeholder="21"
                style={inputStyle}
              />
            </Field>

            <SelectWithOther
              name="study_level"
              label="Year of study"
              options={[
                { value: "undergrad", label: "Undergrad" },
                { value: "honours", label: "Honours" },
                { value: "masters", label: "Masters" },
                { value: "phd", label: "PhD" },
                { value: "other", label: "Other" },
              ]}
              required
            />
          </div>

          <SelectWithOther
            name="sexuality"
            label="Sexuality"
            options={[
              { value: "straight", label: "Straight" },
              { value: "gay", label: "Gay" },
              { value: "lesbian", label: "Lesbian" },
              { value: "bisexual", label: "Bisexual" },
              { value: "pansexual", label: "Pansexual" },
              { value: "asexual", label: "Asexual" },
              { value: "other", label: "Other" },
            ]}
            required
          />

          <SelectWithOther
            name="heard_from"
            label="How did you hear about us?"
            options={[
              { value: "instagram", label: "Instagram" },
              { value: "tiktok", label: "TikTok" },
              { value: "friend", label: "Friend or word of mouth" },
              { value: "poster", label: "Poster or flyer on campus" },
              { value: "campus-event", label: "Campus event or stall" },
              { value: "other", label: "Other" },
            ]}
            required
          />

          <div>
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
                name="signup_with_friend"
                type="checkbox"
                checked={wantsFriend}
                onChange={(e) => setWantsFriend(e.target.checked)}
                style={{ marginTop: "0.2rem" }}
              />
              <span>Sign up with a friend?</span>
            </label>

            {wantsFriend && (
              <div style={{ marginTop: "0.75rem", display: "grid", gap: "0.75rem" }}>
                <Field label="Friend's university email">
                  <input
                    name="friend_email"
                    type="email"
                    required={wantsFriend}
                    placeholder="you@student.unimelb.edu.au"
                    autoComplete="off"
                    style={inputStyle}
                  />
                </Field>

                <SelectWithOther
                  name="friend_gender"
                  label="Friend's gender"
                  options={[
                    { value: "male", label: "Male" },
                    { value: "female", label: "Female" },
                    { value: "non-binary", label: "Non-binary" },
                    { value: "other", label: "Other" },
                  ]}
                  required={wantsFriend}
                />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <Field label="Friend's age">
                    <input
                      name="friend_age"
                      type="number"
                      required={wantsFriend}
                      min={18}
                      max={100}
                      placeholder="21"
                      style={inputStyle}
                    />
                  </Field>

                  <SelectWithOther
                    name="friend_sexuality"
                    label="Friend's sexuality"
                    options={[
                      { value: "straight", label: "Straight" },
                      { value: "gay", label: "Gay" },
                      { value: "lesbian", label: "Lesbian" },
                      { value: "bisexual", label: "Bisexual" },
                      { value: "pansexual", label: "Pansexual" },
                      { value: "asexual", label: "Asexual" },
                      { value: "other", label: "Other" },
                    ]}
                    required={wantsFriend}
                  />
                </div>
                <p
                  style={{
                    margin: "0.5rem 0 0",
                    fontSize: "0.72rem",
                    lineHeight: 1.5,
                    color: "rgba(43,27,18,0.6)",
                  }}
                >
                  We&rsquo;ll try to match you both for a group date, but
                  depending on signups you might still be matched for a solo date.
                </p>
              </div>
            )}
          </div>

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

          {/* Not an alert: nothing is wrong, so it neither shouts in red nor
              interrupts a screen reader the way role="alert" would. */}
          {state.notice && (
            <p
              role="status"
              style={{
                margin: 0,
                fontSize: "0.8rem",
                lineHeight: 1.5,
                color: "var(--ink, #2B1B12)",
                background: "rgba(239,227,205,0.75)",
                borderLeft: "3px solid var(--terracotta, #C1512F)",
                borderRadius: "6px",
                padding: "0.7rem 0.85rem",
              }}
            >
              {state.notice}
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
            marginTop: "0.75rem",
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
  padding: "0.5rem 0.75rem",
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
          marginBottom: "0.25rem",
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

// A select where picking "Other" reveals a text input right underneath it.
// Uncontrolled (matches the rest of this form) — only tracks whether "Other"
// is currently picked, not the field's own value, so the browser still owns
// that. The typed answer posts as "<name>_other"; the server action swaps it
// in for the literal word "other" via lib/pilot.ts's resolveOtherField.
function SelectWithOther({
  name,
  label,
  options,
  required,
}: {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  required?: boolean;
}) {
  const [isOther, setIsOther] = useState(false);
  return (
    <Field label={label}>
      <select
        name={name}
        required={required}
        defaultValue=""
        onChange={(e) => setIsOther(e.target.value === "other")}
        style={inputStyle}
      >
        <option value="" disabled>
          Select…
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {isOther && (
        <input
          name={`${name}_other`}
          type="text"
          required={required}
          placeholder="Please specify"
          autoComplete="off"
          style={{ ...inputStyle, marginTop: "0.5rem" }}
        />
      )}
    </Field>
  );
}
