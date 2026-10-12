// app/admin/page.tsx
import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/require-admin";
import AdminImageList from "@/components/AdminImageList";
import MiniScanChart from "@/components/MiniScanChart";
import { connection } from "next/server";

export default function AdminPage() {
  return (
    <Suspense fallback={<p className="p-8 text-slate-400">Loading…</p>}>
      <AdminContent />
    </Suspense>
  );
}

async function AdminContent() {
  // 👇 Force this page to render dynamically (not prerendered)
  await connection();

  if (!(await isAdmin())) {
    redirect("/admin/login");
  }

  // ---- Fetch data in parallel ----
  const [imagesRes, scansCountRes, reportsCountRes, recentScansRes] =
    await Promise.all([
      supabaseAdmin
        .from("images")
        .select("id, url, size, mime, created_at")
        .order("created_at", { ascending: false })
        .limit(100),

      supabaseAdmin.from("scans").select("*", { count: "exact", head: true }),

      supabaseAdmin.from("reports").select("*", { count: "exact", head: true }),

      // Last 30 days of scans for the mini chart
      supabaseAdmin
        .from("scans")
        .select("scanned_at")
        .gte(
          "scanned_at",
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        ),
    ]);

  const images = imagesRes.data ?? [];
  const totalScans = scansCountRes.count ?? 0;
  const totalReports = reportsCountRes.count ?? 0;
  const scans = recentScansRes.data ?? [];

  // ---- Compute derived data ----
  const now = new Date();
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const weekStart = todayStart - 6 * 24 * 60 * 60 * 1000;

  let scansToday = 0;
  let scansThisWeek = 0;

  // Buckets: 30 days, oldest first
  const scansByDay = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    scansByDay.set(d.toISOString().slice(0, 10), 0);
  }

  for (const s of scans) {
    const t = new Date(s.scanned_at).getTime();
    if (t >= todayStart) scansToday++;
    if (t >= weekStart) scansThisWeek++;

    const key = new Date(s.scanned_at).toISOString().slice(0, 10);
    if (scansByDay.has(key)) {
      scansByDay.set(key, (scansByDay.get(key) ?? 0) + 1);
    }
  }

  const chartData = Array.from(scansByDay.entries()).map(([date, count]) => ({
    date,
    label: new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    count,
  }));

  return (
    <main className="min-h-screen bg-slate-50 p-6 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Admin</h1>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/admin/stats" className="text-blue-600 hover:underline">
              Full stats →
            </Link>
            <Link href="/" className="text-slate-500 hover:underline">
              Home
            </Link>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Stat label="Total images" value={images.length} />
          <Stat label="Total scans" value={totalScans} />
          <Stat label="Scans today" value={scansToday} />
          <Stat label="Scans this week" value={scansThisWeek} />
        </div>

        {/* 30-day mini chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-700">
              Scans — last 30 days
            </h2>
            <span className="text-xs text-slate-500">
              {totalReports} report{totalReports === 1 ? "" : "s"} pending
            </span>
          </div>
          <MiniScanChart data={chartData} />
        </div>

        {/* Recent uploads */}
        <h2 className="text-lg font-semibold mb-3 text-slate-900">
          Recent uploads
        </h2>
        <AdminImageList initialImages={images} />
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <p className="text-xs uppercase text-slate-500 tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
    </div>
  );
}
