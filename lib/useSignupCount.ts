"use client";
import { useEffect, useState } from "react";

// Padding added to the real DB count so an empty/early list still feels like
// it has momentum. The signup goal that gates launch.
const MOMENTUM = 20;
export const SIGNUP_GOAL = 100;

// Fetches the live waitlist count from the API and adds the momentum padding.
// Returns null until the first fetch resolves so callers can show a placeholder.
export function useSignupCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/waitlist")
      .then((r) => r.json())
      .then((d) => {
        if (active) setCount((d.count ?? 0) + MOMENTUM);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return count;
}
