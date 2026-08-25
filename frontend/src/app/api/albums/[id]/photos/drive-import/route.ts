import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentStudio } from "@/lib/auth";
import {
  extractDriveFolderId,
  listDriveImages,
  driveThumbnailUrl,
  driveDownloadUrl,
} from "@/lib/google-drive";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const bodySchema = z.object({
  driveLink: z.string().min(1),
});

function sanitizeFilename(name: string) {
  return name.replace(/[\\/:*?"<>|]/g, "_").replace(/^\.+/, "");
}

/** Imports images from a publicly-shared ("Anyone with the link") Google
 * Drive folder — same instant-import approach as photo.maclife.vn: this
 * only calls Drive's files.list (metadata, no image bytes) so pasting a
 * link stays fast no matter how many photos are in the folder. Photo rows
 * point straight at Drive's own thumbnail/download URLs — nothing is
 * downloaded to or stored on our server. This trades a bit of
 * durability (the preview breaks if the studio later unshares the Drive
 * folder) for near-instant import, which is what was explicitly chosen. */
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

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: { message: "Thiếu link Google Drive" } }, { status: 400 });
  }

  const folderId = extractDriveFolderId(parsed.data.driveLink);
  if (!folderId) {
    return NextResponse.json(
      { error: { message: "Link Google Drive không hợp lệ" } },
      { status: 400 }
    );
  }

  let driveFiles;
  try {
    driveFiles = await listDriveImages(folderId);
  } catch (e) {
    return NextResponse.json({ error: { message: String(e instanceof Error ? e.message : e) } }, { status: 400 });
  }
  if (driveFiles.length === 0) {
    return NextResponse.json(
      { error: { message: "Không tìm thấy ảnh nào trong folder — kiểm tra chế độ chia sẻ (Anyone with the link)." } },
      { status: 400 }
    );
  }

  const existing = await prisma.photo.findMany({
    where: { albumId: album.id },
    select: { filename: true },
  });
  const existingNames = new Set(existing.map((p) => p.filename));

  let added = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const file of driveFiles) {
    const filename = sanitizeFilename(file.name);
    if (!filename) continue;
    if (existingNames.has(filename)) {
      skipped++;
      continue;
    }
    try {
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
        },
      });
      existingNames.add(filename);
      added++;
    } catch (e) {
      errors.push(`${filename}: ${String(e instanceof Error ? e.message : e)}`);
    }
  }

  if (added > 0) {
    const photoCount = await prisma.photo.count({ where: { albumId: album.id } });
    await prisma.album.update({ where: { id: album.id }, data: { photoCount } });
  }

  return NextResponse.json({ added, skipped, errors });
}
