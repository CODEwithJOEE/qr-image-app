// components/ReportButton.tsx
"use client";

import { useState } from "react";

const REASONS = [
  { value: "nudity", label: "Nudity or sexual content" },
  { value: "violence", label: "Violence or gore" },
  { value: "harassment", label: "Harassment or hate" },
  { value: "spam", label: "Spam or scam" },
  { value: "other", label: "Other" },
] as const;

type Status = "idle" | "submitting" | "done" | "error";

export default function ReportButton({ imageId }: { imageId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>("nudity");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const submit = async () => {
    setStatus("submitting");
    setError("");
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId, reason, notes }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit report.");
        setStatus("error");
        return;
      }
      setStatus("done");
    } catch {
      setError("Network error.");
      setStatus("error");
    }
  };

  // Already reported — show a thank-you
  if (status === "done") {
    return (
      <p className="text-xs text-slate-500">
        ✓ Thanks — this report has been sent for review.
      </p>
    );
  }

  // Collapsed: just a small "Report" link
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-slate-400 hover:text-red-600 hover:underline"
      >
        ⚑ Report this image
      </button>
    );
  }

  // Expanded: reason + notes
  return (
    <div className="mt-2 rounded-lg border border-slate-200 bg-white p-4 text-left max-w-md">
      <p className="text-sm font-medium text-slate-900 mb-3">
        Why are you reporting this image?
      </p>

      <select
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 mb-3"
        disabled={status === "submitting"}
      >
        {REASONS.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Optional: add details (max 500 chars)"
        maxLength={500}
        rows={3}
        className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 mb-3"
        disabled={status === "submitting"}
      />

      {error && <p className="text-xs text-red-600 mb-3">{error}</p>}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError("");
          }}
          disabled={status === "submitting"}
          className="text-sm px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={status === "submitting"}
          className="text-sm px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
        >
          {status === "submitting" ? "Sending…" : "Submit report"}
        </button>
      </div>
    </div>
  );
}
