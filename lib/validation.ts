// lib/validation.ts
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export type AllowedMime = (typeof ALLOWED_MIME_TYPES)[number];

export type ValidationResult =
  | { ok: true; mime: AllowedMime; ext: string }
  | { ok: false; error: string };

const MIME_TO_EXT: Record<AllowedMime, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function validateImage(file: File): ValidationResult {
  if (!ALLOWED_MIME_TYPES.includes(file.type as AllowedMime)) {
    return {
      ok: false,
      error: `Unsupported file type. Allowed: JPG, PNG, WebP, GIF.`,
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    const mb = (file.size / 1024 / 1024).toFixed(2);
    return {
      ok: false,
      error: `File is too large (${mb} MB). Maximum is 5 MB.`,
    };
  }

  if (file.size === 0) {
    return { ok: false, error: "File is empty." };
  }

  return {
    ok: true,
    mime: file.type as AllowedMime,
    ext: MIME_TO_EXT[file.type as AllowedMime],
  };
}
