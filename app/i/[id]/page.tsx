// app/i/[id]/page.tsx
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { trackScan } from "@/lib/track-scan";

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
    <main className="min-h-screen flex items-center justify-center">
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

  // 👇 Fire-and-forget scan tracking (don't block render)
  trackScan(id);
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.url}
            alt="Shared image"
            className="w-full h-auto max-h-[80vh] object-contain bg-slate-100"
          />
        </div>

        <div className="mt-6 flex items-center justify-between text-sm">
          <p className="text-slate-500">
            Shared on {new Date(data.created_at).toLocaleDateString()}
          </p>
          <a href={data.url} download className="text-blue-600 hover:underline">
            Download original
          </a>
        </div>
      </div>
    </main>
  );
}
