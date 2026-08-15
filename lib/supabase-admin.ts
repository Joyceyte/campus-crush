// Service-role Supabase client. Bypasses RLS, so it must only ever be used
// from server code — Server Actions, Server Components, Route Handlers.
//
// pilot_signups has RLS enabled with no policies at all, which means this is
// the only client that can touch it. That's deliberate: nothing about a
// student's signup should be reachable from a browser.
import { createClient } from "@supabase/supabase-js";

export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
