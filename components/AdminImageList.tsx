// components/AdminImageList.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Trash2 } from "lucide-react";

type ImageRow = {
  id: string;
  url: string;
  size: number;
  mime: string;
  created_at: string;
  scans?: number;
};

export default function AdminImageList({
  initialImages,
}: {
  initialImages: ImageRow[];
}) {
  const [images, setImages] = useState(initialImages);
  const router = useRouter();

  const remove = async (id: string) => {
    if (!confirm(`Delete ${id}? This cannot be undone.`)) return;

    const prev = images;
    setImages((curr) => curr.filter((i) => i.id !== id));

    const res = await fetch(`/api/admin/delete/${id}`, { method: "DELETE" });

    if (!res.ok) {
      setImages(prev);
      alert("Delete failed.");
      return;
    }
    router.refresh();
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
              {img.scans !== undefined && (
                <>
                  {" • "}
                  <span
                    className={img.scans > 0 ? "text-blue-600 font-medium" : ""}
                  >
                    {img.scans} scan{img.scans === 1 ? "" : "s"}
                  </span>
                </>
              )}
            </p>
          </div>
          <a
            href={img.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-xs text-blue-600 hover:underline px-2 py-1 rounded hover:bg-blue-50"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View
          </a>
          <button
            onClick={() => remove(img.id)}
            className="flex items-center gap-1 text-xs text-red-600 hover:underline px-2 py-1 rounded hover:bg-red-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
