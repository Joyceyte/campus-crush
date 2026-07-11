import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await supabase
    .from("venues")
    .select("id, name, discount, photo_url, logo_url")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("venues fetch failed:", error);
    return NextResponse.json({ venues: [] });
  }

  return NextResponse.json({ venues: data ?? [] });
}
