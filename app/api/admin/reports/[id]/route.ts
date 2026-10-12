// app/api/admin/reports/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/require-admin";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const reportId = parseInt(id, 10);

  if (isNaN(reportId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("reports")
    .delete()
    .eq("id", reportId);

  if (error) {
    console.error("Report delete failed:", error);
    return NextResponse.json(
      { error: "Failed to delete report" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
