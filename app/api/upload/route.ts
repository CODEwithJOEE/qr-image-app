// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { validateImage, MAX_FILE_SIZE } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    // Server-side re-validation (never trust the client)
    const check = validateImage(file);
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: 400 });
    }

    // Extra hard guard on size in case someone bypasses the client
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File exceeds 5 MB limit." },
        { status: 413 },
      );
    }

    // Generate short ID (8 chars → short URL → small QR)
    const id = nanoid(8);
    const path = `${id}.${check.ext}`;

    // Convert File → ArrayBuffer → Buffer for the Supabase client
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage (bucket name: 'images')
    const { error: uploadErr } = await supabaseAdmin.storage
      .from("images")
      .upload(path, buffer, {
        contentType: check.mime,
        cacheControl: "31536000", // 1 year — immutable
        upsert: false,
      });

    if (uploadErr) {
      console.error("Storage upload failed:", uploadErr);
      return NextResponse.json(
        { error: "Failed to store image." },
        { status: 500 },
      );
    }

    // Get the public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from("images")
      .getPublicUrl(path);

    const publicUrl = publicUrlData.publicUrl;

    // Insert metadata row
    const { error: dbErr } = await supabaseAdmin.from("images").insert({
      id,
      url: publicUrl,
      mime: check.mime,
      size: file.size,
    });

    if (dbErr) {
      console.error("DB insert failed:", dbErr);
      // Best-effort cleanup of the just-uploaded file
      await supabaseAdmin.storage.from("images").remove([path]);
      return NextResponse.json(
        { error: "Failed to save image record." },
        { status: 500 },
      );
    }

    // Build the public "view" URL the QR code will encode
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
