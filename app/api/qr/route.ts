// app/api/qr/route.ts
import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  const sizeParam = req.nextUrl.searchParams.get("size") ?? "512";
  const size = Math.min(Math.max(parseInt(sizeParam, 10) || 512, 128), 1024);

  if (!url) {
    return NextResponse.json({ error: "Missing url param" }, { status: 400 });
  }

  try {
    const png = await QRCode.toBuffer(url, {
      type: "png",
      width: size,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#0f172a", light: "#ffffff" },
    });

    return new NextResponse(new Uint8Array(png), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("QR generation error:", err);
    return NextResponse.json(
      { error: "QR generation failed" },
      { status: 500 },
    );
  }
}
