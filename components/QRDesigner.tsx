// components/QRDesigner.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import QRCodeStyling, { type Options } from "qr-code-styling";

const DOT_STYLES = [
  { value: "square", label: "Square" },
  { value: "rounded", label: "Rounded" },
  { value: "dots", label: "Dots" },
  { value: "classy", label: "Classy" },
  { value: "classy-rounded", label: "Classy Rounded" },
  { value: "extra-rounded", label: "Extra Rounded" },
] as const;

type DotStyle = (typeof DOT_STYLES)[number]["value"];

const PRESET_COLORS = [
  { fg: "#0f172a", bg: "#ffffff", name: "Classic" },
  { fg: "#1d4ed8", bg: "#ffffff", name: "Blue" },
  { fg: "#dc2626", bg: "#ffffff", name: "Red" },
  { fg: "#16a34a", bg: "#ffffff", name: "Green" },
  { fg: "#ffffff", bg: "#0f172a", name: "Dark mode" },
  { fg: "#f59e0b", bg: "#1e293b", name: "Amber" },
];

const SIZES = [256, 512, 1024] as const;
type Size = (typeof SIZES)[number];

export default function QRDesigner({
  url,
  filename,
}: {
  url: string;
  filename: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);

  const [fg, setFg] = useState("#0f172a");
  const [bg, setBg] = useState("#ffffff");
  const [dotStyle, setDotStyle] = useState<DotStyle>("rounded");
  const [size, setSize] = useState<Size>(512);
  const [downloading, setDownloading] = useState(false);

  const buildOptions = (): Options => ({
    width: size,
    height: size,
    type: "canvas",
    data: url,
    margin: 20,
    qrOptions: {
      errorCorrectionLevel: "M",
    },
    imageOptions: {
      crossOrigin: "anonymous",
      margin: 8,
    },
    dotsOptions: {
      color: fg,
      type: dotStyle as any,
    },
    backgroundOptions: {
      color: bg,
    },
    cornersSquareOptions: {
      color: fg,
      type: "extra-rounded",
    },
    cornersDotOptions: {
      color: fg,
    },
  });

  // (Re)create instance when options change
  useEffect(() => {
    if (!ref.current) return;

    const qr = new QRCodeStyling(buildOptions());
    qrRef.current = qr;
    ref.current.innerHTML = "";
    qr.append(ref.current);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fg, bg, dotStyle, size, url]);

  const handleDownload = async () => {
    if (!qrRef.current) return;
    setDownloading(true);
    try {
      const blob = await qrRef.current.getRawData("png");
      if (!blob) throw new Error("No blob returned");

      const imageBlob =
        blob instanceof Blob ? blob : new Blob([blob as BlobPart]);

      const blobUrl = URL.createObjectURL(imageBlob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Download failed. Try right-clicking the QR and saving the image.");
    } finally {
      setDownloading(false);
    }
  };

  const applyPreset = (preset: { fg: string; bg: string }) => {
    setFg(preset.fg);
    setBg(preset.bg);
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 items-start">
      {/* LEFT: QR preview + download */}
      <div className="flex flex-col items-center min-w-0">
        <div
          className="rounded-2xl overflow-hidden shadow-sm border border-slate-200 p-4 w-full max-w-[320px] flex items-center justify-center"
          style={{ background: bg }}
        >
          <div
            ref={ref}
            className="w-full [&_canvas]:!w-full [&_canvas]:!h-auto [&_canvas]:block"
          />
        </div>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="mt-6 w-full max-w-[320px] py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {downloading ? "Preparing…" : "Download QR Code (PNG)"}
        </button>
      </div>

      {/* RIGHT: Controls */}
      <div className="space-y-6 min-w-0">
        {/* Preset colors */}
        <div>
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Presets
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {PRESET_COLORS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => applyPreset(p)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-400 text-sm"
              >
                <span
                  className="w-4 h-4 rounded-full border border-slate-300"
                  style={{ background: p.fg }}
                />
                <span>{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Foreground color */}
        <div>
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Foreground color
          </label>
          <div className="mt-2 flex items-center gap-3">
            <input
              type="color"
              value={fg}
              onChange={(e) => setFg(e.target.value)}
              className="w-12 h-10 rounded cursor-pointer border border-slate-200 flex-shrink-0"
            />
            <input
              type="text"
              value={fg}
              onChange={(e) => setFg(e.target.value)}
              className="flex-1 min-w-0 text-sm font-mono border border-slate-300 rounded-lg px-3 py-2"
            />
          </div>
        </div>

        {/* Background color */}
        <div>
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Background color
          </label>
          <div className="mt-2 flex items-center gap-3">
            <input
              type="color"
              value={bg}
              onChange={(e) => setBg(e.target.value)}
              className="w-12 h-10 rounded cursor-pointer border border-slate-200 flex-shrink-0"
            />
            <input
              type="text"
              value={bg}
              onChange={(e) => setBg(e.target.value)}
              className="flex-1 min-w-0 text-sm font-mono border border-slate-300 rounded-lg px-3 py-2"
            />
          </div>
        </div>

        {/* Dot style */}
        <div>
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Dot style
          </label>
          <select
            value={dotStyle}
            onChange={(e) => setDotStyle(e.target.value as DotStyle)}
            className="mt-2 w-full text-sm border border-slate-300 rounded-lg px-3 py-2"
          >
            {DOT_STYLES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Size */}
        <div>
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Export size
          </label>
          <div className="mt-2 flex gap-2">
            {SIZES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={[
                  "flex-1 py-2 rounded-lg text-sm border transition-colors",
                  size === s
                    ? "border-blue-600 bg-blue-50 text-blue-700 font-medium"
                    : "border-slate-200 hover:border-slate-400",
                ].join(" ")}
              >
                {s}px
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-400">
          💡 Dark QR codes on light backgrounds scan best. Keep good contrast.
        </p>
      </div>
    </div>
  );
}
