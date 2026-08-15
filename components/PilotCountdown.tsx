"use client";
import { useEffect, useState } from "react";
import { PILOT_CLOSES_AT } from "@/lib/pilot";

// Live countdown to the signup deadline.
//
// Renders nothing on the server and on the first client paint: the remaining
// time differs between the two, and rendering it during hydration would either
// mismatch or flash a wrong value. Space is reserved by the parent instead, so
// nothing shifts when it appears.
function remaining(now: number) {
  const ms = PILOT_CLOSES_AT.getTime() - now;
  if (ms <= 0) return null;

  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Seconds only matter once they're meaningful. Showing them four days out
  // is noise; showing them in the last hour is urgency.
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${seconds}s`;
}

export default function PilotCountdown() {
  const [label, setLabel] = useState<string | null>(null);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    const tick = () => {
      const value = remaining(Date.now());
      if (value === null) {
        setClosed(true);
        setLabel(null);
      } else {
        setLabel(value);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (closed) {
    return (
      <span
        style={{
          fontSize: "0.72rem",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "rgba(43,27,18,0.6)",
        }}
      >
        signups closed
      </span>
    );
  }

  if (!label) return null;

  return (
    <span
      style={{
        fontSize: "0.72rem",
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "var(--terracotta)",
        fontVariantNumeric: "tabular-nums",
        animation: "fadeIn 0.4s ease",
      }}
    >
      {label} left
    </span>
  );
}
