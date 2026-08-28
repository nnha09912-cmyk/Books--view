import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import archiver from "archiver";
import { prisma } from "@/lib/db";
import { downloadCookieName, verifyDownloadUnlock } from "@/lib/auth";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { buildDownloadJpeg, downloadFilename } from "@/lib/photo-download";

const MAX_ZIP_PHOTOS = 500;

const bodySchema = z.object({
  photoIds: z.array(z.string().min(1)).min(1).max(MAX_ZIP_PHOTOS),
});

function jsonError(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

/** Wraps archiver's Node event stream as a Web ReadableStream, independent
 * of any Node-stream/Web-stream interop details — archiver just needs to be
 * a plain EventEmitter emitting 'data'/'end'/'error' here. */
function archiveToWebStream(archive: archiver.Archiver): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      archive.on("data", (chunk: Buffer) => controller.enqueue(new Uint8Array(chunk)));
      archive.on("end", () => controller.close());
      archive.on("error", (err) => controller.error(err));
    },
  });
}

/** Bulk Download — bundles multiple already-resized photos (2048px JPEG,
 * same as the single-photo Download) into one ZIP, streamed as it's built
 * so the response starts immediately instead of waiting for every photo to
 * resize first. Gated identically to the single-photo endpoint: Album
 * Settings' "Cho phép tải ảnh" + its optional Download password — no guest
 * identification required. Which photos to include (all / liked / starred
 * / both) is decided client-side from the guest's own already-loaded
 * like/star state and passed in as an explicit id list, since the server
 * has no guest session to derive that from here. */
export async function POST(
  req: NextRequest,
  { params }: { params: { linkToken: string } }
) {
  const album = await prisma.album.findUnique({
    where: { linkToken: params.linkToken },
    select: {
      id: true,
      status: true,
      expiryDate: true,
      downloadEnabled: true,
      downloadPasswordHash: true,
      downloadExpiryDate: true,
    },
  });
  if (!album) {
    return jsonError("NOT_FOUND", "Không tìm thấy album", 404);
  }
  if (album.status === "closed") {
    return jsonError("ALBUM_CLOSED", "Album này đã đóng, không thể tải ảnh.", 403);
  }
  if (album.expiryDate && album.expiryDate < new Date()) {
    return jsonError("ALBUM_EXPIRED", "Album đã hết hạn, không thể tải ảnh.", 403);
  }
  if (!album.downloadEnabled) {
    return jsonError("DOWNLOAD_DISABLED", "Album này không cho phép tải ảnh.", 403);
  }
  if (album.downloadExpiryDate && album.downloadExpiryDate < new Date()) {
    return jsonError("DOWNLOAD_EXPIRED", "Đã hết hạn tải ảnh cho album này.", 403);
  }

  if (album.downloadPasswordHash) {
    const token = req.cookies.get(downloadCookieName(params.linkToken))?.value;
    const unlock = token ? verifyDownloadUnlock(token) : null;
    if (!unlock || unlock.albumId !== album.id) {
      return jsonError("DOWNLOAD_LOCKED", "Cần nhập mật khẩu tải ảnh.", 401);
    }
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return jsonError("VALIDATION_ERROR", "Dữ liệu không hợp lệ", 400);
  }

  // Bulk ZIP is heavier than a single download — a tighter cap keeps this
  // from becoming a resource-exhaustion vector.
  if (!checkRateLimit(`download-zip:${album.id}:${clientIp(req)}`, 5, 5 * 60 * 1000)) {
    return jsonError("RATE_LIMITED", "Bạn tải ảnh quá nhanh, thử lại sau ít phút nhé.", 429);
  }

  // IDOR guard: only photos that actually belong to this album are ever
  // read — any id in the request that doesn't match is silently dropped
  // rather than erroring, since the client only ever sends ids it already
  // trusts from its own loaded photo list.
  const photos = await prisma.photo.findMany({
    where: { id: { in: parsed.data.photoIds }, albumId: album.id },
    select: { id: true, filename: true, googleDriveId: true },
  });
  if (photos.length === 0) {
    return jsonError("NOT_FOUND", "Không có ảnh nào để tải.", 404);
  }

  const archive = archiver("zip", { zlib: { level: 9 } });
  const usedNames = new Set<string>();

  (async () => {
    for (const photo of photos) {
      try {
        const buffer = await buildDownloadJpeg(album.id, photo);
        let name = downloadFilename(photo.filename);
        // Two source files with the same base name (e.g. IMG_0001 imported
        // twice under different extensions) would otherwise silently
        // overwrite each other inside the zip.
        if (usedNames.has(name)) {
          name = `${photo.id}-${name}`;
        }
        usedNames.add(name);
        archive.append(buffer, { name });
      } catch (e) {
        console.error("zip entry failed", photo.id, e);
        // Skip this one photo, keep building the rest of the archive.
      }
    }
    archive.finalize();
  })().catch((e) => {
    console.error("zip build failed", e);
    archive.abort();
  });

  const zipName = `photos-${photos.length}.zip`;
  return new NextResponse(archiveToWebStream(archive), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${zipName}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
