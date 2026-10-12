// app/api/track/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const { imageId } = await req.json();

    if (typeof imageId !== "string" || !imageId) {
      return NextResponse.json({ error: "Missing imageId" }, { status: 400 });
    }

    const referrer = req.headers.get("referer") ?? null;
    const country = req.headers.get("x-vercel-ip-country") ?? null;

    await supabaseAdmin.from("scans").insert({
      image_id: imageId,
      referrer,
      country,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Track error:", err);
    return NextResponse.json({ error: "Track failed" }, { status: 500 });
  }
}
