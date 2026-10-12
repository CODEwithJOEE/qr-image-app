"use client";

import { useCallback, useRef, useState } from "react";
import { validateImage, MAX_FILE_SIZE } from "@/lib/validation";
import { useRouter } from "next/navigation";
import { Upload, ImagePlus, X, QrCode } from "lucide-react";

type Status = "idle" | "validating" | "uploading" | "error";

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const reset = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setError(null);
    setStatus("idle");
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleFile = useCallback(
    (incoming: File) => {
      setError(null);
      setStatus("validating");

      const result = validateImage(incoming);
      if (!result.ok) {
        setError(result.error);
        setStatus("error");
        setFile(null);
        if (preview) URL.revokeObjectURL(preview);
        setPreview(null);
        return;
      }

      if (preview) URL.revokeObjectURL(preview);
      setFile(incoming);
      setPreview(URL.createObjectURL(incoming));
      setStatus("idle");
    },
    [preview],
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const onDragLeave = () => setDragging(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setStatus("uploading");
    setError(null);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();

      if (!res.ok) {
        // Rate limit errors get a distinct message
        if (res.status === 429) {
          setError(data.error || "Too many uploads. Please wait a bit.");
        } else {
          setError(data.error || "Upload failed. Please try again.");
        }
        setStatus("error");
        return;
      }

      // Redirect to the success page with the new ID
      router.push(`/success/${data.id}`);
    } catch (err) {
      console.error(err);
      setError("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  };

  const busy = status === "uploading" || status === "validating";

  return (
    <form onSubmit={onSubmit} className="w-full max-w-xl mx-auto space-y-6">
      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => !busy && inputRef.current?.click()}
        className={[
          "relative flex flex-col items-center justify-center",
          "w-full min-h-[280px] rounded-2xl border-2 border-dashed",
          "cursor-pointer transition-all text-center p-6",
          dragging
            ? "border-blue-500 bg-blue-50"
            : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50",
          busy ? "opacity-60 cursor-not-allowed" : "",
        ].join(" ")}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={onInputChange}
          disabled={busy}
        />

        {preview ? (
          <div className="flex flex-col items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Preview"
              className="max-h-64 max-w-full rounded-lg shadow-sm object-contain"
            />
            <p className="text-sm text-slate-600 truncate max-w-[18rem]">
              {file?.name} • {(file!.size / 1024).toFixed(0)} KB
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                reset();
              }}
              className="inline-flex items-center gap-1 text-xs text-red-600 hover:underline"
            >
              <X className="w-3.5 h-3.5" />
              Remove & choose another
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 pointer-events-none">
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-2">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-base font-medium text-slate-700">
              Drag &amp; drop your image here
            </p>
            <p className="text-sm text-slate-500">
              or <span className="text-blue-600 underline">browse files</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              JPG, PNG, WebP, GIF — up to {MAX_FILE_SIZE / 1024 / 1024} MB
            </p>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!file || busy}
        className={[
          "w-full py-3 rounded-xl font-medium transition-all",
          "bg-blue-600 text-white hover:bg-blue-700",
          "disabled:bg-slate-300 disabled:cursor-not-allowed",
          "flex items-center justify-center gap-2",
        ].join(" ")}
      >
        {status === "uploading" ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Generating QR code…
          </>
        ) : (
          <>
            <QrCode className="w-4 h-4" />
            Generate QR Code
          </>
        )}
      </button>
    </form>
  );
}
