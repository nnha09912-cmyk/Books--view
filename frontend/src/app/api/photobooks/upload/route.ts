import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { getCurrentStudio } from "@/lib/auth";
import { resizeForPhotobook, InvalidImageError, MAX_UPLOAD_FILE_BYTES } from "@/lib/image-resize";
import { checkRateLimit } from "@/lib/rate-limit";

/** One file per request, called from the Photobook editor for every photo
 * the studio adds (and again for a photo-cover pick) — resized to
 * 2048px/72dpi via resizeForPhotobook before ever touching disk, same
 * "never store what the client sent untouched" rule as the real Album's
 * Download pipeline. Saved under public/uploads/photobooks/{studioId}/ —
 * the same local-disk convention Album's own legacy local-upload path
 * already uses (see photos/optimize, photo-download.ts), not Vercel Blob;
 * this app's actual deploy target is AZDIGI's own persistent disk, not
 * Vercel's serverless/ephemeral filesystem. */
export async function POST(req: NextRequest) {
  const studio = await getCurrentStudio();
  if (!studio) {
    return NextResponse.json({ error: { message: "Chưa đăng nhập" } }, { status: 401 });
  }
  if (!checkRateLimit(`photobook-upload:${studio.id}`, 120, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: { message: "Bạn tải ảnh quá nhanh, thử lại sau ít phút nhé." } },
      { status: 429 }
    );
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: { message: "Không có file nào được gửi lên" } }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_FILE_BYTES) {
    return NextResponse.json({ error: { message: "File quá lớn." } }, { status: 400 });
  }

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const resized = await resizeForPhotobook(bytes);
    const filename = `${randomBytes(8).toString("hex")}.jpg`;
    const dir = path.join(process.cwd(), "public", "uploads", "photobooks", studio.id);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), resized.buffer);
    const url = `/uploads/photobooks/${studio.id}/${encodeURIComponent(filename)}`;
    return NextResponse.json({ url, width: resized.width, height: resized.height });
  } catch (err) {
    if (err instanceof InvalidImageError) {
      return NextResponse.json({ error: { message: err.message } }, { status: 400 });
    }
    throw err;
  }
}
