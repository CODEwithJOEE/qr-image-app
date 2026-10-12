// lib/track-scan.ts
import "server-only";
import { headers } from "next/headers";
import { supabaseAdmin } from "./supabase-admin";

export async function trackScan(imageId: string) {
  try {
    const h = await headers();
    const referrer = h.get("referer") ?? null;
    const country = h.get("x-vercel-ip-country") ?? null; // Vercel sets this in prod

    await supabaseAdmin.from("scans").insert({
      image_id: imageId,
      referrer,
      country,
    });
  } catch (err) {
    // Never crash the page because of analytics
    console.error("trackScan failed:", err);
  }
}
