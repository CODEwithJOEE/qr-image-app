// app/api/cron/cleanup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  // 🔒 Verify the request is from Vercel Cron (or you)
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const days = parseInt(process.env.IMAGE_RETENTION_DAYS ?? "0", 10);

  // If retention is 0 or invalid, skip cleanup
  if (!days || days <= 0) {
    return NextResponse.json({
      ok: true,
      message: "Retention disabled — nothing to clean up.",
      deleted: 0,
    });
  }

  const cutoff = new Date(
    Date.now() - days * 24 * 60 * 60 * 1000,
  ).toISOString();

  // 1. Find expired images
  const { data: expired, error: selectErr } = await supabaseAdmin
    .from("images")
    .select("id, mime, url")
    .lt("created_at", cutoff);

  if (selectErr) {
    console.error("Cleanup select failed:", selectErr);
    return NextResponse.json({ error: "DB query failed" }, { status: 500 });
  }

  if (!expired || expired.length === 0) {
    return NextResponse.json({
      ok: true,
      message: "No expired images.",
      deleted: 0,
    });
  }

  // 2. Build storage paths
  const paths = expired.map((row) => {
    const ext = row.mime.split("/")[1].replace("jpeg", "jpg");
    return `${row.id}.${ext}`;
  });

  // 3. Delete from storage (best-effort, log failures)
  const { error: storageErr } = await supabaseAdmin.storage
    .from("images")
    .remove(paths);

  if (storageErr) {
    console.error("Storage cleanup failed:", storageErr);
    // Continue anyway — DB rows will be deleted next
  }

  // 4. Delete DB rows (scans + reports cascade)
  const { error: deleteErr } = await supabaseAdmin
    .from("images")
    .delete()
    .in(
      "id",
      expired.map((r) => r.id),
    );

  if (deleteErr) {
    console.error("DB cleanup failed:", deleteErr);
    return NextResponse.json({ error: "DB delete failed" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    message: `Cleaned up ${expired.length} expired image${
      expired.length === 1 ? "" : "s"
    }.`,
    deleted: expired.length,
  });
}
