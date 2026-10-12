// app/page.tsx
import Link from "next/link";
import {
  Upload,
  QrCode,
  Share2,
  Shield,
  Zap,
  Sparkles,
  Image as ImageIcon,
} from "lucide-react";
import UploadForm from "@/components/UploadForm";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #0f172a 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative max-w-4xl mx-auto px-6 py-16 sm:py-20">
        {/* Hero */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs font-medium text-blue-700 mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Free • No signup required
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">
            Turn any image into a <span className="text-blue-600">QR code</span>
          </h1>

          <p className="mt-4 text-lg text-slate-600 max-w-xl mx-auto">
            Upload a picture, customize a QR code, and share it. Anyone who
            scans it will see your image instantly.
          </p>
        </header>

        {/* Upload form */}
        <UploadForm />

        {/* Feature highlights */}
        <section className="mt-16 grid sm:grid-cols-3 gap-4">
          <Feature
            icon={<Zap className="w-5 h-5 text-amber-500" />}
            title="Instant"
            desc="Upload, generate, and download in seconds."
          />
          <Feature
            icon={<Shield className="w-5 h-5 text-green-500" />}
            title="Private"
            desc="Public URLs with unguessable short IDs."
          />
          <Feature
            icon={<ImageIcon className="w-5 h-5 text-purple-500" />}
            title="Full quality"
            desc="Images stay at original resolution."
          />
        </section>

        {/* How it works */}
        <section className="mt-16">
          <h2 className="text-center text-sm font-semibold uppercase tracking-wider text-slate-400 mb-6">
            How it works
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Step
              icon={<Upload className="w-5 h-5" />}
              step="1"
              title="Upload"
              desc="Drop any image up to 5 MB"
            />
            <Step
              icon={<QrCode className="w-5 h-5" />}
              step="2"
              title="Customize"
              desc="Pick colors, dot styles, and size"
            />
            <Step
              icon={<Share2 className="w-5 h-5" />}
              step="3"
              title="Share"
              desc="Download the PNG and print or post"
            />
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-20 text-center">
          <p className="text-xs text-slate-400 mb-3">
            Images are hosted publicly. Anyone with the QR code can view them.
          </p>
          <div className="flex items-center justify-center gap-4 text-xs">
            <Link
              href="/admin/login"
              className="text-slate-400 hover:text-slate-600"
            >
              Admin
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}

// ---- Helpers ----

function Feature({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 text-left">
      <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className="font-semibold text-slate-900 text-sm">{title}</h3>
      <p className="text-xs text-slate-600 mt-1">{desc}</p>
    </div>
  );
}

function Step({
  icon,
  step,
  title,
  desc,
}: {
  icon: React.ReactNode;
  step: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 text-center">
      <div className="w-10 h-10 mx-auto rounded-full bg-blue-50 text-blue-700 font-semibold flex items-center justify-center mb-3">
        {icon}
      </div>
      <p className="text-xs font-semibold text-blue-600 mb-1">STEP {step}</p>
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="text-xs text-slate-500 mt-1">{desc}</p>
    </div>
  );
}
