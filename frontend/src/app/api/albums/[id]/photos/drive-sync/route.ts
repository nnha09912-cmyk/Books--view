import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentStudio } from "@/lib/auth";
import {
  listDriveImages,
  driveThumbnailUrl,
  driveDownloadUrl,
  sanitizeDriveFilename,
} from "@/lib/google-drive";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Re-scans the Drive folder an album was imported from and reconciles
 * Photo rows to match it exactly — adds files that are new in Drive and
 * deletes rows for files no longer there (renamed-in-Drive edge case:
 * matched by Drive file id when we have it, falling back to filename for
 * photos imported before googleDriveId was tracked). This is what "Đồng
 * bộ ảnh" means for a Drive-sourced album — unlike drive-import, which
 * only ever adds. */
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
  if (!album.googleDriveFolderId) {
    return NextResponse.json(
      { error: { message: "Album này chưa nhập ảnh từ Google Drive." } },
      { status: 400 }
    );
  }

  let driveFiles;
  try {
    driveFiles = await listDriveImages(album.googleDriveFolderId);
  } catch (e) {
    return NextResponse.json({ error: { message: String(e instanceof Error ? e.message : e) } }, { status: 400 });
  }

  const existing = await prisma.photo.findMany({
    where: { albumId: album.id },
    select: { id: true, filename: true, googleDriveId: true },
  });

  const driveIds = new Set(driveFiles.map((f) => f.id));
  const driveFilenames = new Set(driveFiles.map((f) => sanitizeDriveFilename(f.name)));
  const existingByFilename = new Set(existing.map((p) => p.filename));

  let added = 0;
  for (const file of driveFiles) {
    const filename = sanitizeDriveFilename(file.name);
    if (!filename || existingByFilename.has(filename)) continue;
    const previewUrl = file.thumbnailLink
      ? driveThumbnailUrl(file.thumbnailLink, 1600)
      : driveDownloadUrl(file.id);
    await prisma.photo.create({
      data: {
        albumId: album.id,
        filename,
        originalUrl: driveDownloadUrl(file.id),
        thumbnailUrl: previewUrl,
        previewUrl,
        fileSize: file.size ? Number(file.size) : null,
        mimeType: file.mimeType || null,
        googleDriveId: file.id,
      },
    });
    existingByFilename.add(filename);
    added++;
  }

  // Still in Drive if either its tracked Drive id or its filename matches
  // the live listing — the filename fallback covers photos imported
  // before googleDriveId was recorded.
  const toRemove = existing.filter(
    (p) =>
      !(p.googleDriveId ? driveIds.has(p.googleDriveId) : driveFilenames.has(p.filename))
  );
  let removed = 0;
  if (toRemove.length > 0) {
    const result = await prisma.photo.deleteMany({
      where: { id: { in: toRemove.map((p) => p.id) } },
    });
    removed = result.count;
  }

  const photoCount = await prisma.photo.count({ where: { albumId: album.id } });
  await prisma.album.update({ where: { id: album.id }, data: { photoCount } });

  return NextResponse.json({ added, removed, total: photoCount });
}
