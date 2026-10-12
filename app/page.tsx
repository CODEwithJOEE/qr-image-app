import UploadForm from "@/components/UploadForm";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <header className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">
            Turn any image into a <span className="text-blue-600">QR code</span>
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-xl mx-auto">
            Upload a picture, get a scannable QR code. Anyone who scans it will
            see your image instantly.
          </p>
        </header>

        <UploadForm />

        <section className="mt-16 grid sm:grid-cols-3 gap-6 text-center">
          {[
            { step: "1", title: "Upload", desc: "Drop any image up to 5 MB" },
            {
              step: "2",
              title: "Generate",
              desc: "We create a QR code for you",
            },
            {
              step: "3",
              title: "Share",
              desc: "Download the PNG and share it",
            },
          ].map((s) => (
            <div
              key={s.step}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <div className="w-8 h-8 mx-auto mb-3 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center text-sm">
                {s.step}
              </div>
              <h3 className="font-semibold text-slate-900">{s.title}</h3>
              <p className="text-sm text-slate-600 mt-1">{s.desc}</p>
            </div>
          ))}
        </section>

        <footer className="mt-16 text-center text-xs text-slate-400">
          Images are hosted publicly. Anyone with the QR code can view them.
        </footer>
      </div>
    </main>
  );
}
