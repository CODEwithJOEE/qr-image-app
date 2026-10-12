// app/admin/stats/page.tsx
import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/require-admin";
import StatsDashboard from "@/components/StatsDashboard";
import {
  ArrowLeft,
  Image as ImageIcon,
  ScanLine,
  Calendar,
  TrendingUp,
  BarChart3,
  Users,
  Clock,
} from "lucide-react";

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

  // 1. All images
  const { data: images } = await supabaseAdmin
    .from("images")
    .select("id, created_at")
    .order("created_at", { ascending: false });

  // 2. All scans (last 30 days only to keep payload small)
  const thirtyDaysAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data: scans } = await supabaseAdmin
    .from("scans")
    .select("id, image_id, scanned_at, referrer, country")
    .gte("scanned_at", thirtyDaysAgo)
    .order("scanned_at", { ascending: false });

  // 3. Total scan count all-time
  const { count: totalScans } = await supabaseAdmin
    .from("scans")
    .select("*", { count: "exact", head: true });

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

  // Scans per image (for top 10)
  const scansByImage = new Map<string, number>();

  // Scans per day (for line chart, last 30 days)
  const scansByDay = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    scansByDay.set(key, 0);
  }

  // Referrer counts
  const referrerCounts = new Map<string, number>();

  for (const s of scans ?? []) {
    const t = new Date(s.scanned_at).getTime();
    if (t >= todayStart) scansToday++;
    if (t >= weekStart) scansThisWeek++;

    scansByImage.set(s.image_id, (scansByImage.get(s.image_id) ?? 0) + 1);

    const dayKey = new Date(s.scanned_at).toISOString().slice(0, 10);
    if (scansByDay.has(dayKey)) {
      scansByDay.set(dayKey, (scansByDay.get(dayKey) ?? 0) + 1);
    }

    // Parse referrer into a friendly source
    let source = "Direct";
    if (s.referrer) {
      try {
        const refUrl = new URL(s.referrer);
        source = refUrl.hostname.replace(/^www\./, "");
      } catch {
        source = "Unknown";
      }
    }
    referrerCounts.set(source, (referrerCounts.get(source) ?? 0) + 1);
  }

  // Top 10 images by scans
  const topImages = Array.from(scansByImage.entries())
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Scans by day array for chart
  const scansByDayArray = Array.from(scansByDay.entries()).map(
    ([date, count]) => ({
      date,
      label: new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      count,
    }),
  );

  // Top referrers
  const topReferrers = Array.from(referrerCounts.entries())
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Recent scans
  const recentScans = (scans ?? []).slice(0, 20).map((s) => ({
    id: s.id,
    imageId: s.image_id,
    scannedAt: s.scanned_at,
    referrer: s.referrer,
    country: s.country,
  }));

  const summary = {
    totalImages: images?.length ?? 0,
    totalScans: totalScans ?? 0,
    scansToday,
    scansThisWeek,
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Analytics Dashboard
          </h1>
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Admin
          </Link>
        </div>

        <StatsDashboard
          summary={summary}
          topImages={topImages}
          scansByDay={scansByDayArray}
          topReferrers={topReferrers}
          recentScans={recentScans}
        />
      </div>
    </main>
  );
}
