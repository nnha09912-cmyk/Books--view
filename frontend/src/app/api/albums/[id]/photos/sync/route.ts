import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/db";
import { getCurrentStudio } from "@/lib/auth";
import { resizeForWeb, InvalidImageError } from "@/lib/image-resize";
import { checkRateLimit } from "@/lib/rate-limit";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Bounds how much a single sync request can make the server decode/process
// in one shot — independent of the per-file size/pixel limits in
// resizeForWeb, which only bound one file at a time.
const MAX_FILES_PER_SYNC = 60;

function sanitizeFilename(name: string) {
  return name.replace(/[\\/:*?"<>|]/g, "_").replace(/^\.+/, "");
}

function previewFilename(filename: string) {
  return filename.replace(/\.[^.]+$/, "") + ".jpg";
}

/** Syncs locally-picked photos (via the browser's File System Access API on
 * the client) into the album: saves new files under public/uploads and
 * creates Photo rows so the public gallery can serve them by URL. */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const studio = await getCurrentStudio();
  if (!studio) {
    return NextResponse.json({ error: { message: "Chưa đăng nhập" } }, { status: 401 });
  }
  if (!UUID_RE.test(params.id)) {
    return NextResponse.json({ error: { message: "Không tìm thấy album" } }, { status: 404 });
  }
  const album = await prisma.album.findFirst({
    where: { id: params.id, studioId: studio.id },
  });
  if (!album) {
    return NextResponse.json({ error: { message: "Không tìm thấy album" } }, { status: 404 });
  }
  if (!checkRateLimit(`drive-sync:${studio.id}`, 10, 5 * 60 * 1000)) {
    return NextResponse.json(
      { error: { message: "Bạn đồng bộ quá nhanh, thử lại sau ít phút nhé." } },
      { status: 429 }
    );
  }

  const form = await req.formData();
  const overwrite = form.get("overwrite") === "true";
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ error: { message: "Không có file nào được gửi lên" } }, { status: 400 });
  }
  if (files.length > MAX_FILES_PER_SYNC) {
    return NextResponse.json(
      { error: { message: `Chỉ được đồng bộ tối đa ${MAX_FILES_PER_SYNC} ảnh mỗi lần.` } },
      { status: 400 }
    );
  }

  const existing = await prisma.photo.findMany({
    where: { albumId: album.id },
    select: { id: true, filename: true },
  });
  const existingByName = new Map(existing.map((p) => [p.filename, p.id]));

  let added = 0;
  let overwritten = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const file of files) {
    const filename = sanitizeFilename(file.name);
    if (!filename) continue;
    const already = existingByName.get(filename);
    if (already && !overwrite) {
      skipped++;
      continue;
    }
    try {
      const bytes = Buffer.from(await file.arrayBuffer());

      // Validate (real decode + format allowlist + size/pixel limits) BEFORE
      // anything touches disk — a file that isn't actually a supported
      // image must never be written into public/uploads, since that
      // directory is served directly to the web.
      const previewBytes = await resizeForWeb(bytes);

      const original = await put(`albums/${album.id}/${filename}`, bytes, {
        access: "public",
        contentType: file.type || undefined,
        // Sanitized filenames can still collide across re-syncs (that's
        // exactly the `already`/overwrite case below) — a random suffix
        // would break the "same URL means same photo" assumption the
        // overwrite path relies on, so keep the deterministic pathname.
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      const url = original.url;

      // Web-facing views (grid/masonry/carousel/lightbox) load the resized
      // preview — same URL everywhere so the browser has it cached before
      // the lightbox even opens. originalUrl keeps the untouched file for
      // the explicit Download action.
      const previewName = previewFilename(filename);
      const preview = await put(`albums/${album.id}/previews/${previewName}`, previewBytes, {
        access: "public",
        contentType: "image/jpeg",
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      const previewUrl = preview.url;

      if (already) {
        await prisma.photo.update({
          where: { id: already },
          data: {
            originalUrl: url,
            thumbnailUrl: previewUrl,
            previewUrl,
            fileSize: bytes.length,
          },
        });
        overwritten++;
      } else {
        await prisma.photo.create({
          data: {
            albumId: album.id,
            filename,
            originalUrl: url,
            thumbnailUrl: previewUrl,
            previewUrl,
            fileSize: bytes.length,
            mimeType: file.type || null,
          },
        });
        added++;
      }
    } catch (e) {
      console.error(`sync failed for ${filename}`, e);
      const message = e instanceof InvalidImageError ? e.message : "Không thể xử lý ảnh này";
      errors.push(`${filename}: ${message}`);
    }
  }

  if (added > 0) {
    const photoCount = await prisma.photo.count({ where: { albumId: album.id } });
    await prisma.album.update({ where: { id: album.id }, data: { photoCount } });
  }

  return NextResponse.json({ added, overwritten, skipped, errors });
}
