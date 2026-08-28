import { NextResponse } from "next/server";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db";
import { getCurrentStudio } from "@/lib/auth";
import { resizeForWeb } from "@/lib/image-resize";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function previewFilename(filename: string) {
  return filename.replace(/\.[^.]+$/, "") + ".jpg";
}

/** One-time backfill for photos uploaded before previews existed (or from
 * before resizeForWeb was added) — their thumbnailUrl/previewUrl still
 * point at the full-resolution original. Displaying a multi-thousand-
 * pixel camera JPEG at thumbnail size forces the browser into an extreme
 * downscale that renders as torn/banded strips in some engines. This
 * regenerates a proper small preview for any local-upload photo missing
 * one; Drive-sourced and external-URL photos are already sized and are
 * left untouched. */
export async function POST(
  req: Request,
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

  const photos = await prisma.photo.findMany({
    where: {
      albumId: album.id,
      originalUrl: { startsWith: "/uploads/" },
      NOT: { thumbnailUrl: { contains: "/previews/" } },
    },
    select: { id: true, filename: true, originalUrl: true },
  });

  if (photos.length === 0) {
    return NextResponse.json({ optimized: 0, errors: [] });
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", album.id);
  const previewDir = path.join(uploadDir, "previews");
  await mkdir(previewDir, { recursive: true });

  let optimized = 0;
  const errors: string[] = [];

  for (const photo of photos) {
    try {
      const relative = decodeURIComponent(photo.originalUrl).replace(/^\/uploads\//, "");
      const originalPath = path.join(process.cwd(), "public", "uploads", relative);
      const bytes = await readFile(originalPath);
      const previewBytes = await resizeForWeb(bytes);
      const previewName = previewFilename(photo.filename);
      await writeFile(path.join(previewDir, previewName), previewBytes);
      const previewUrl = `/uploads/${album.id}/previews/${encodeURIComponent(previewName)}`;
      await prisma.photo.update({
        where: { id: photo.id },
        data: { thumbnailUrl: previewUrl, previewUrl },
      });
      optimized++;
    } catch (e) {
      console.error(`optimize failed for ${photo.filename}`, e);
      errors.push(`${photo.filename}: Không thể xử lý ảnh này`);
    }
  }

  return NextResponse.json({ optimized, errors });
}
