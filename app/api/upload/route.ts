// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { validateImage, MAX_FILE_SIZE } from "@/lib/validation";
import { checkUploadRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    // 🔒 Rate limit check FIRST — before reading the file body
    const ip = getClientIp(req);
    const rl = await checkUploadRateLimit(ip);

    if (!rl.ok) {
      const resetSeconds = Math.max(
        0,
        Math.ceil((rl.reset - Date.now()) / 1000),
      );
      const minutes = Math.ceil(resetSeconds / 60);

      return NextResponse.json(
        {
          error:
            rl.reason === "hourly"
              ? `You're uploading too fast. Try again in ${minutes} minute${
                  minutes === 1 ? "" : "s"
                }.`
              : `You've hit today's upload limit. Try again tomorrow.`,
          resetInSeconds: resetSeconds,
        },
        { status: 429 },
      );
    }

    // ✅ From here on, everything is exactly as it was before
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const check = validateImage(file);
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File exceeds 5 MB limit." },
        { status: 413 },
      );
    }

    const id = nanoid(8);
    const path = `${id}.${check.ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadErr } = await supabaseAdmin.storage
      .from("images")
      .upload(path, buffer, {
        contentType: check.mime,
        cacheControl: "31536000",
        upsert: false,
      });

    if (uploadErr) {
      console.error("Storage upload failed:", uploadErr);
      return NextResponse.json(
        { error: "Failed to store image." },
        { status: 500 },
      );
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from("images")
      .getPublicUrl(path);

    const publicUrl = publicUrlData.publicUrl;

    const { error: dbErr } = await supabaseAdmin.from("images").insert({
      id,
      url: publicUrl,
      mime: check.mime,
      size: file.size,
    });

    if (dbErr) {
      console.error("DB insert failed:", dbErr);
      await supabaseAdmin.storage.from("images").remove([path]);
      return NextResponse.json(
        { error: "Failed to save image record." },
        { status: 500 },
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;

    return NextResponse.json({
      id,
      viewUrl: `${appUrl}/i/${id}`,
      imageUrl: publicUrl,
    });
  } catch (err) {
    console.error("Upload route error:", err);
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 },
    );
  }
}
