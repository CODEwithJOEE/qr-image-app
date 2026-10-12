// app/admin/reports/page.tsx
import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { connection } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/require-admin";
import ReportsList from "@/components/ReportsList";
import { ArrowLeft, Flag } from "lucide-react";

export default function ReportsPage() {
  return (
    <Suspense fallback={<p className="p-8 text-slate-400">Loading…</p>}>
      <ReportsContent />
    </Suspense>
  );
}

async function ReportsContent() {
  await connection();

  if (!(await isAdmin())) {
    redirect("/admin/login");
  }

  const { data: reports } = await supabaseAdmin
    .from("reports")
    .select(
      `
      id,
      image_id,
      reason,
      notes,
      reported_at,
      images (
        id,
        url,
        mime,
        size,
        created_at
      )
    `,
    )
    .order("reported_at", { ascending: false });

  return (
    <main className="min-h-screen bg-slate-50 p-6 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Flag className="w-6 h-6 text-red-600" />
              Reported Images
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {reports?.length ?? 0} total report
              {(reports?.length ?? 0) === 1 ? "" : "s"}
            </p>
          </div>
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Admin
          </Link>
        </div>

        <ReportsList initialReports={reports ?? []} />
      </div>
    </main>
  );
}
