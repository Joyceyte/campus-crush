"use client";
import { useEffect } from "react";
import { markSignedUp } from "@/lib/founders-note";

// Renders nothing. Only exists because the pilot success page is a Server
// Component and localStorage is client-only — this is the bridge that tells
// the founders note to stop coming back for someone who's actually paid.
export default function MarkSignedUp() {
  useEffect(() => {
    markSignedUp();
  }, []);
  return null;
}
