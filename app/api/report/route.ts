// app/api/report/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { checkReportRateLimit, getClientIp } from "@/lib/rate-limit";

const ALLOWED_REASONS = [
  "nudity",
  "violence",
  "harassment",
  "spam",
  "other",
] as const;

type Reason = (typeof ALLOWED_REASONS)[number];

export async function POST(req: NextRequest) {
  try {
    // 🔒 Rate limit
    const ip = getClientIp(req);
    const rl = await checkReportRateLimit(ip);
    if (!rl.ok) {
      const minutes = Math.ceil((rl.reset - Date.now()) / 1000 / 60);
      return NextResponse.json(
        { error: `Too many reports. Try again in ${minutes} min.` },
        { status: 429 },
      );
    }

    const body = await req.json();
    const { imageId, reason, notes } = body;

    if (typeof imageId !== "string" || !imageId) {
      return NextResponse.json({ error: "Missing imageId" }, { status: 400 });
    }

    if (!ALLOWED_REASONS.includes(reason as Reason)) {
      return NextResponse.json({ error: "Invalid reason" }, { status: 400 });
    }

    const safeNotes =
      typeof notes === "string" ? notes.slice(0, 500).trim() || null : null;

    const { error } = await supabaseAdmin.from("reports").insert({
      image_id: imageId,
      reason,
      // store notes in a column we haven't added yet — we'll add it below
      // notes: safeNotes,
    });

    if (error) {
      console.error("Report insert failed:", error);
      return NextResponse.json(
        { error: "Failed to save report." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Report error:", err);
    return NextResponse.json({ error: "Report failed" }, { status: 500 });
  }
}
