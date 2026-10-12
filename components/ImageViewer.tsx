// components/ImageViewer.tsx
"use client";

import { useState } from "react";

export default function ImageViewer({
  imageUrl,
  imageId,
  createdAt,
}: {
  imageUrl: string;
  imageId: string;
  createdAt: string;
}) {
  const [fullscreen, setFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleShare = async () => {
    // Try native share (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this image",
          url: shareUrl,
        });
        return;
      } catch {
        // User cancelled or unsupported — fall through to copy
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      alert("Could not copy link.");
    }
  };

  const handleDownload = async () => {
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `image-${imageId}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      // If fetch fails (CORS), open in new tab as fallback
      window.open(imageUrl, "_blank");
    }
  };

  return (
    <>
      {/* Normal inline view */}
      <div className="flex flex-col items-center">
        <button
          onClick={() => setFullscreen(true)}
          className="group relative rounded-2xl overflow-hidden border border-slate-700 shadow-2xl bg-slate-800 cursor-zoom-in"
          aria-label="View fullscreen"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Shared image"
            className="max-h-[70vh] w-auto object-contain"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
            <span className="text-xs bg-black/70 text-white px-3 py-1 rounded-full">
              Click to expand
            </span>
          </div>
        </button>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={handleDownload}
            className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
          >
            ⬇ Download
          </button>
          <button
            onClick={handleShare}
            className="px-5 py-2.5 rounded-full bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium transition-colors"
          >
            {copied ? "✓ Link copied" : "↗ Share"}
          </button>
        </div>
      </div>

      {/* Fullscreen overlay */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setFullscreen(false)}
        >
          <button
            onClick={() => setFullscreen(false)}
            className="absolute top-4 right-4 text-white text-3xl leading-none w-10 h-10 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/80"
            aria-label="Close fullscreen"
          >
            ×
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Shared image"
            className="max-h-full max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
