// app/success/[id]/page.tsx
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Link2,
  Image as ImageIcon,
  ArrowLeft,
  Download,
} from "lucide-react";
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
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
      <div className="flex items-center gap-2 text-slate-400">
        <span className="inline-block w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
        Loading…
      </div>
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
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-100 text-xs font-medium text-green-700 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Upload complete
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
            Your QR code is ready
          </h1>

          <p className="mt-3 text-slate-600 max-w-xl mx-auto">
            Customize the design, then download it as a PNG. Anyone who scans it
            will see your image instantly.
          </p>
        </div>

        {/* QR Designer card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <QRDesigner url={viewUrl} filename={`qr-${id}.png`} />

          {/* Link section */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              <Link2 className="w-3.5 h-3.5" />
              Links to
            </label>
            <CopyableUrlInput url={viewUrl} />
          </div>
        </div>

        {/* Image preview */}
        <div className="mt-10 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <ImageIcon className="w-4 h-4 text-purple-500" />
              Your image
            </h2>
            <a
              href={data.url}
              download
              className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline"
            >
              <Download className="w-3.5 h-3.5" />
              Download original
            </a>
          </div>

          <div className="flex justify-center bg-slate-50 rounded-xl p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.url}
              alt="Uploaded"
              className="max-h-72 rounded-lg object-contain"
            />
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
            <span>
              {(data.size / 1024).toFixed(0)} KB • {data.mime}
            </span>
            <span>Uploaded {new Date(data.created_at).toLocaleString()}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Upload another image
          </Link>
          <Link
            href={`/i/${id}`}
            target="_blank"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            <ImageIcon className="w-4 h-4" />
            Preview public page
          </Link>
        </div>
      </div>
    </main>
  );
}
