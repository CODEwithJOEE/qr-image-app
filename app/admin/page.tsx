// app/admin/page.tsx
import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/require-admin";
import AdminImageList from "@/components/AdminImageList";
import MiniScanChart from "@/components/MiniScanChart";
import { connection } from "next/server";
import {
  Flag,
  BarChart3,
  Home,
  Image as ImageIcon,
  ScanLine,
  Calendar,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

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

  // Get scan counts per image
  const { data: scanCounts } = await supabaseAdmin
    .from("scans")
    .select("image_id");

  const scansPerImage = new Map<string, number>();
  for (const s of scanCounts ?? []) {
    scansPerImage.set(s.image_id, (scansPerImage.get(s.image_id) ?? 0) + 1);
  }

  // Attach counts to the images array
  const imagesWithScans = images.map((img) => ({
    ...img,
    scans: scansPerImage.get(img.id) ?? 0,
  }));

  return (
    <main className="min-h-screen bg-slate-50 p-6 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Admin</h1>
          <div className="flex items-center gap-5 text-sm">
            <Link
              href="/admin/reports"
              className="flex items-center gap-1.5 text-red-600 hover:underline font-medium"
            >
              <Flag className="w-4 h-4" />
              Reports
            </Link>
            <Link
              href="/admin/stats"
              className="flex items-center gap-1.5 text-blue-600 hover:underline"
            >
              <BarChart3 className="w-4 h-4" />
              Stats
            </Link>
            <Link
              href="/"
              className="flex items-center gap-1.5 text-slate-500 hover:underline"
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Stat
            label="Total images"
            value={images.length}
            icon={<ImageIcon className="w-5 h-5 text-blue-500" />}
          />
          <Stat
            label="Total scans"
            value={totalScans}
            icon={<ScanLine className="w-5 h-5 text-purple-500" />}
          />
          <Stat
            label="Scans today"
            value={scansToday}
            icon={<Calendar className="w-5 h-5 text-green-500" />}
          />
          <Stat
            label="Scans this week"
            value={scansThisWeek}
            icon={<TrendingUp className="w-5 h-5 text-amber-500" />}
          />
        </div>

        {/* 30-day mini chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-700">
              Scans — last 30 days
            </h2>
            <Link
              href="/admin/reports"
              className={`flex items-center gap-1 text-xs ${
                totalReports > 0
                  ? "text-red-600 font-medium hover:underline"
                  : "text-slate-500 hover:underline"
              }`}
            >
              {totalReports > 0 && <AlertTriangle className="w-3.5 h-3.5" />}
              {totalReports} report{totalReports === 1 ? "" : "s"} pending
              {totalReports > 0 && "→"}
            </Link>
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

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs uppercase text-slate-500 tracking-wide">
          {label}
        </p>
        {icon}
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
