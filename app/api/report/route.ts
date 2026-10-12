// app/api/report/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const { imageId, reason } = await req.json();

    if (typeof imageId !== "string" || !imageId) {
      return NextResponse.json({ error: "Missing imageId" }, { status: 400 });
    }

    await supabaseAdmin.from("reports").insert({
      image_id: imageId,
      reason: typeof reason === "string" ? reason.slice(0, 500) : null,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Report error:", err);
    return NextResponse.json({ error: "Report failed" }, { status: 500 });
  }
}
