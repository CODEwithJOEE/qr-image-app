// components/AdminImageList.tsx
"use client";

import { useState } from "react";

type ImageRow = {
  id: string;
  url: string;
  size: number;
  mime: string;
  created_at: string;
};

export default function AdminImageList({
  initialImages,
}: {
  initialImages: ImageRow[];
}) {
  const [images, setImages] = useState(initialImages);

  const remove = async (id: string) => {
    if (!confirm(`Delete ${id}? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/delete/${id}`, { method: "DELETE" });
    if (res.ok) {
      setImages((prev) => prev.filter((i) => i.id !== id));
    } else {
      alert("Delete failed.");
    }
  };

  if (images.length === 0) {
    return <p className="text-sm text-slate-500">No images yet.</p>;
  }

  return (
    <ul className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
      {images.map((img) => (
        <li key={img.id} className="flex items-center gap-4 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img.url}
            alt=""
            className="w-14 h-14 object-cover rounded-lg border border-slate-200"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-mono truncate">{img.id}</p>
            <p className="text-xs text-slate-500">
              {(img.size / 1024).toFixed(0)} KB • {img.mime} •{" "}
              {new Date(img.created_at).toLocaleString()}
            </p>
          </div>
          <a
            href={img.url}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-blue-600 hover:underline"
          >
            View
          </a>
          <button
            onClick={() => remove(img.id)}
            className="text-xs text-red-600 hover:underline"
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
