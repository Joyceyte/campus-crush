"use client";
import { useEffect, useState } from "react";

const MESSAGE = "semester 2 pilot is open, partnered venues, closes 1 september";
const TYPE_MS = 80; // deliberately slow, one keystroke at a time
const HOLD_MS = 6000; // linger on the full sentence before retyping
const RESTART_MS = 900;

export default function LaunchBanner() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Reduced motion: skip the animation, show the full sentence.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setCount(MESSAGE.length);
      return;
    }
    let i = 0;
    let timeout: ReturnType<typeof setTimeout>;
    const step = () => {
      if (i < MESSAGE.length) {
        i += 1;
        setCount(i);
        timeout = setTimeout(step, TYPE_MS);
      } else {
        timeout = setTimeout(() => {
          i = 0;
          setCount(0);
          timeout = setTimeout(step, RESTART_MS);
        }, HOLD_MS);
      }
    };
    timeout = setTimeout(step, 600);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div
      role="status"
      aria-label={MESSAGE}
      className="hero-banner"
      style={{
        background: "var(--terracotta-deep)",
        borderTop: "1px solid rgba(247,239,225,0.14)",
        borderBottom: "1px solid rgba(247,239,225,0.14)",
        padding: "0.7rem 1.25rem",
        textAlign: "center",
      }}
    >
      {/* Both layers share one grid cell: the invisible full sentence sizes
          the cell (so the banner never reflows as characters appear) and the
          typed text stacks on top of it — nothing is clipped, unlike an
          absolutely-positioned overlay. */}
      <span aria-hidden="true" style={{ display: "inline-grid", textAlign: "left" }}>
        <span
          className="font-jersey"
          style={{
            gridArea: "1 / 1",
            visibility: "hidden",
            fontSize: "1.4rem",
            lineHeight: 1.4,
            letterSpacing: "0.08em",
            textTransform: "lowercase",
            fontWeight: 400,
          }}
        >
          {MESSAGE}
        </span>
        <span
          className="font-jersey"
          style={{
            gridArea: "1 / 1",
            fontSize: "1.4rem",
            lineHeight: 1.4,
            letterSpacing: "0.08em",
            textTransform: "lowercase",
            fontWeight: 400,
            color: "var(--parchment)",
          }}
        >
          {MESSAGE.slice(0, count)}
          {/* Zero-width anchor: the cursor renders sticking out of it, so it
              never counts toward line layout and can't wrap to the next line
              by itself — it always hangs off the last typed character. */}
          <span style={{ display: "inline-block", width: 0, overflow: "visible" }}>
            <span className="type-cursor" />
          </span>
        </span>
      </span>
    </div>
  );
}
