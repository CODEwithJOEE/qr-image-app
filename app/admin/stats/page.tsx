// app/admin/stats/page.tsx
import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/require-admin";

export default function StatsPage() {
  return (
    <Suspense fallback={<p className="p-8 text-slate-400">Loading…</p>}>
      <StatsContent />
    </Suspense>
  );
}

async function StatsContent() {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }

  const { data: images } = await supabaseAdmin
    .from("images")
    .select("id, created_at")
    .order("created_at", { ascending: false });

  const { data: scans } = await supabaseAdmin
    .from("scans")
    .select("image_id, scanned_at");

  // Count scans per image
  const scanCounts = new Map<string, number>();
  for (const s of scans ?? []) {
    scanCounts.set(s.image_id, (scanCounts.get(s.image_id) ?? 0) + 1);
  }

  const rows = (images ?? []).map((img) => ({
    id: img.id,
    created_at: img.created_at,
    scans: scanCounts.get(img.id) ?? 0,
  }));

  const totalScans = scans?.length ?? 0;

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Scan Statistics</h1>
          <Link href="/admin" className="text-sm text-blue-600 hover:underline">
            ← Back to Admin
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
          <p className="text-xs uppercase text-slate-500">Total scans</p>
          <p className="text-2xl font-bold mt-1">{totalScans}</p>
        </div>

        {rows.length === 0 ? (
          <p className="text-sm text-slate-500">No images yet.</p>
        ) : (
          <ul className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
            {rows.map((r) => (
              <li key={r.id} className="flex items-center justify-between p-3">
                <div>
                  <p className="text-sm font-mono">{r.id}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(r.created_at).toLocaleString()}
                  </p>
                </div>
                <span className="text-sm font-semibold">
                  {r.scans} scan{r.scans === 1 ? "" : "s"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
