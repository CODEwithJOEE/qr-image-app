// app/admin/page.tsx
import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/require-admin";
import AdminImageList from "@/components/AdminImageList";

export default function AdminPage() {
  return (
    <Suspense fallback={<p className="p-8 text-slate-400">Loading…</p>}>
      <AdminContent />
    </Suspense>
  );
}

async function AdminContent() {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }

  const { data: images } = await supabaseAdmin
    .from("images")
    .select("id, url, size, mime, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  const { count: totalScans } = await supabaseAdmin
    .from("scans")
    .select("*", { count: "exact", head: true });

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Admin</h1>
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            ← Home
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <Stat label="Total images" value={images?.length ?? 0} />
          <Stat label="Total scans" value={totalScans ?? 0} />
        </div>

        <h2 className="text-lg font-semibold mb-3">Recent uploads</h2>
        <AdminImageList initialImages={images ?? []} />
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
