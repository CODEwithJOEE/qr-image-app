// app/success/[id]/page.tsx
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import CopyableUrlInput from "@/components/CopyableUrlInput";
import QRDesigner from "@/components/QRDesigner";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function SuccessPage({ params }: PageProps) {
  return (
    <Suspense fallback={<LoadingShell />}>
      <SuccessContent params={params} />
    </Suspense>
  );
}

function LoadingShell() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <p className="text-slate-400">Loading…</p>
    </main>
  );
}

async function SuccessContent({ params }: PageProps) {
  const { id } = await params;

  const { data, error } = await supabaseAdmin
    .from("images")
    .select("id, url, mime, size, created_at")
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const viewUrl = `${appUrl}/i/${id}`;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900">
            Your QR code is ready 🎉
          </h1>
          <p className="mt-2 text-slate-600">
            Customize it, download it, print it. Anyone who scans it will see
            your image.
          </p>
        </div>

        {/* QR designer */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <QRDesigner url={viewUrl} filename={`qr-${id}.png`} />

          <div className="mt-8 pt-6 border-t border-slate-100">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Links to
            </label>
            <CopyableUrlInput url={viewUrl} />
          </div>
        </div>

        {/* Image preview */}
        <div className="mt-10 text-center">
          <p className="text-sm text-slate-500 mb-3">Your image:</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.url}
            alt="Uploaded"
            className="mx-auto max-h-64 rounded-xl border border-slate-200 object-contain"
          />
        </div>

        <div className="mt-10 text-center">
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            ← Upload another image
          </Link>
        </div>
      </div>
    </main>
  );
}
