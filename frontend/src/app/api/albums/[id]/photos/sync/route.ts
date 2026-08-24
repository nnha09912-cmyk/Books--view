import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db";
import { getCurrentStudio } from "@/lib/auth";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function sanitizeFilename(name: string) {
  return name.replace(/[\\/:*?"<>|]/g, "_").replace(/^\.+/, "");
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

  const form = await req.formData();
  const overwrite = form.get("overwrite") === "true";
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ error: { message: "Không có file nào được gửi lên" } }, { status: 400 });
  }

  const existing = await prisma.photo.findMany({
    where: { albumId: album.id },
    select: { id: true, filename: true },
  });
  const existingByName = new Map(existing.map((p) => [p.filename, p.id]));

  const uploadDir = path.join(process.cwd(), "public", "uploads", album.id);
  await mkdir(uploadDir, { recursive: true });

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
      await writeFile(path.join(uploadDir, filename), bytes);
      const url = `/uploads/${album.id}/${encodeURIComponent(filename)}`;

      if (already) {
        await prisma.photo.update({
          where: { id: already },
          data: { originalUrl: url, thumbnailUrl: url, previewUrl: url, fileSize: bytes.length },
        });
        overwritten++;
      } else {
        await prisma.photo.create({
          data: {
            albumId: album.id,
            filename,
            originalUrl: url,
            thumbnailUrl: url,
            previewUrl: url,
            fileSize: bytes.length,
            mimeType: file.type || null,
          },
        });
        added++;
      }
    } catch (e) {
      errors.push(`${filename}: ${String(e)}`);
    }
  }

  if (added > 0) {
    const photoCount = await prisma.photo.count({ where: { albumId: album.id } });
    await prisma.album.update({ where: { id: album.id }, data: { photoCount } });
  }

  return NextResponse.json({ added, overwritten, skipped, errors });
}
