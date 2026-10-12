// components/ReportsList.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Flag, Trash2, X } from "lucide-react";

type Report = {
  id: number;
  image_id: string;
  reason: string | null;
  notes: string | null;
  reported_at: string;
  images:
    | {
        id: string;
        url: string;
        mime: string;
        size: number;
        created_at: string;
      }
    | {
        id: string;
        url: string;
        mime: string;
        size: number;
        created_at: string;
      }[]
    | null;
};

export default function ReportsList({
  initialReports,
}: {
  initialReports: Report[];
}) {
  const [reports, setReports] = useState(initialReports);
  const [busy, setBusy] = useState<Set<number>>(new Set());
  const router = useRouter();

  const getImage = (r: Report) => {
    if (!r.images) return null;
    if (Array.isArray(r.images)) return r.images[0] ?? null;
    return r.images;
  };

  const dismiss = async (reportId: number) => {
    if (!confirm("Dismiss this report? (Image stays, report is deleted)"))
      return;

    setBusy((s) => new Set(s).add(reportId));
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed");
      setReports((prev) => prev.filter((r) => r.id !== reportId));
      router.refresh();
    } catch {
      alert("Failed to dismiss report.");
    } finally {
      setBusy((s) => {
        const next = new Set(s);
        next.delete(reportId);
        return next;
      });
    }
  };

  const deleteImage = async (report: Report) => {
    if (
      !confirm(
        `Delete image ${report.image_id}? This removes the image AND all reports for it.`,
      )
    )
      return;

    setBusy((s) => new Set(s).add(report.id));
    try {
      const res = await fetch(`/api/admin/delete/${report.image_id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed");
      setReports((prev) => prev.filter((r) => r.image_id !== report.image_id));
      router.refresh();
    } catch {
      alert("Failed to delete image.");
    } finally {
      setBusy((s) => {
        const next = new Set(s);
        next.delete(report.id);
        return next;
      });
    }
  };

  if (reports.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <p className="text-4xl mb-3">🎉</p>
        <p className="text-slate-600 font-medium">No reports</p>
        <p className="text-sm text-slate-400 mt-1">
          Nothing to review right now.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {reports.map((r) => {
        const img = getImage(r);
        const isBusy = busy.has(r.id);

        return (
          <li
            key={r.id}
            className={`bg-white rounded-xl border border-slate-200 p-4 flex gap-4 transition-opacity ${
              isBusy ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            {img ? (
              <a
                href={img.url}
                target="_blank"
                rel="noreferrer"
                className="flex-shrink-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt="Reported"
                  className="w-24 h-24 object-cover rounded-lg border border-slate-200 hover:opacity-80"
                />
              </a>
            ) : (
              <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xs text-slate-400">Deleted</span>
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase text-red-600 bg-red-50 px-2 py-0.5 rounded">
                  <Flag className="w-3 h-3" />
                  {r.reason ?? "unknown"}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(r.reported_at).toLocaleString()}
                </span>
              </div>

              <p className="text-sm font-mono text-slate-700 truncate">
                {r.image_id}
              </p>

              {r.notes && (
                <p className="text-sm text-slate-600 mt-1 italic">
                  &ldquo;{r.notes}&rdquo;
                </p>
              )}

              {img && (
                <p className="text-xs text-slate-500 mt-1">
                  {(img.size / 1024).toFixed(0)} KB • Uploaded{" "}
                  {new Date(img.created_at).toLocaleDateString()}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2 justify-center flex-shrink-0">
              <button
                onClick={() => deleteImage(r)}
                className="flex items-center justify-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete image
              </button>
              <button
                onClick={() => dismiss(r.id)}
                className="flex items-center justify-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
              >
                <X className="w-3.5 h-3.5" />
                Dismiss
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
