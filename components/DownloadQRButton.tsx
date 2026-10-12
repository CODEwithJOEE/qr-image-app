// components/DownloadQRButton.tsx
"use client";

export default function DownloadQRButton({
  qrUrl,
  filename,
}: {
  qrUrl: string;
  filename: string;
}) {
  const handleDownload = async () => {
    try {
      const res = await fetch(qrUrl);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error("Download failed:", err);
      alert(
        "Download failed. Please try right-clicking the QR image and saving it.",
      );
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="mt-6 w-full py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
    >
      Download QR Code (PNG)
    </button>
  );
}
