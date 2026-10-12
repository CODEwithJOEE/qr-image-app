// app/i/[id]/page.tsx
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { trackScan } from "@/lib/track-scan";
import ImageViewer from "@/components/ImageViewer";
import ReportButton from "@/components/ReportButton";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function ImagePage({ params }: PageProps) {
  return (
    <Suspense fallback={<LoadingShell />}>
      <ImageContent params={params} />
    </Suspense>
  );
}

function LoadingShell() {
  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center">
      <p className="text-slate-400">Loading image…</p>
    </main>
  );
}

async function ImageContent({ params }: PageProps) {
  const { id } = await params;

  const { data, error } = await supabaseAdmin
    .from("images")
    .select("id, url, mime, created_at")
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  // Count scans (includes current one, once it lands)
  const { count: viewCount } = await supabaseAdmin
    .from("scans")
    .select("*", { count: "exact", head: true })
    .eq("image_id", id);

  // Fire-and-forget scan tracking
  trackScan(id);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm font-semibold text-white hover:text-blue-400 transition-colors"
          >
            QR Image App
          </Link>
          <p className="text-xs text-slate-500">
            {viewCount ?? 0} view{(viewCount ?? 0) === 1 ? "" : "s"}
          </p>
        </div>
      </header>

      {/* Main viewer */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-5xl">
          <ImageViewer
            imageUrl={data.url}
            imageId={data.id}
            createdAt={data.created_at}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between text-xs text-slate-500">
          <p>Shared on {new Date(data.created_at).toLocaleDateString()}</p>
          <ReportButton imageId={id} />
        </div>
      </footer>
    </div>
  );
}
