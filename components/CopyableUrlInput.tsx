// components/CopyableUrlInput.tsx
"use client";

import { useState } from "react";

export default function CopyableUrlInput({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback — select the text
      const input = document.querySelector<HTMLInputElement>("#view-url-input");
      input?.select();
    }
  };

  return (
    <div className="mt-1 flex items-center gap-2">
      <input
        id="view-url-input"
        readOnly
        value={url}
        onFocus={(e) => e.currentTarget.select()}
        className="flex-1 text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="button"
        onClick={handleCopy}
        className="text-sm text-blue-600 hover:underline whitespace-nowrap"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
