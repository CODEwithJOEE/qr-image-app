// app/api/admin/delete/[id]/route.ts
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

  // Look up the mime so we know the storage path
  const { data: row, error } = await supabaseAdmin
    .from("images")
    .select("id, mime")
    .eq("id", id)
    .single();

  if (error || !row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ext = row.mime.split("/")[1].replace("jpeg", "jpg");
  const path = `${id}.${ext}`;

  // Remove from storage + DB (scans & reports cascade)
  await supabaseAdmin.storage.from("images").remove([path]);
  await supabaseAdmin.from("images").delete().eq("id", id);

  return NextResponse.json({ ok: true });
}
