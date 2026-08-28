import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { downloadCookieName, verifyDownloadUnlock } from "@/lib/auth";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { buildDownloadJpeg, downloadFilename } from "@/lib/photo-download";
import { InvalidImageError } from "@/lib/image-resize";

function jsonError(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

/** Guest-facing single-photo Download: never hands out the camera original
 * (Drive or local) — always re-fetches/reads the source server-side and
 * returns a freshly resized 2048px JPEG. Gated purely by Album Settings'
 * "Cho phép tải ảnh" toggle + its own optional Download password (no guest
 * identification required — the password is the authorization). */
export async function GET(
  req: NextRequest,
  { params }: { params: { linkToken: string; photoId: string } }
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

  const photo = await prisma.photo.findFirst({
    where: { id: params.photoId, albumId: album.id },
    select: { id: true, filename: true, googleDriveId: true },
  });
  if (!photo) {
    return jsonError("NOT_FOUND", "Không tìm thấy ảnh trong album này", 404);
  }

  if (!checkRateLimit(`download:${album.id}:${clientIp(req)}`, 30, 60 * 1000)) {
    return jsonError("RATE_LIMITED", "Bạn tải ảnh quá nhanh, thử lại sau nhé.", 429);
  }

  let output: Buffer;
  try {
    output = await buildDownloadJpeg(album.id, photo);
  } catch (e) {
    if (e instanceof InvalidImageError) {
      return jsonError("INVALID_IMAGE", e.message, 500);
    }
    console.error("download failed", photo.id, e);
    return jsonError("DOWNLOAD_FAILED", "Không thể tải ảnh lúc này, thử lại sau nhé.", 502);
  }

  return new NextResponse(new Uint8Array(output), {
    status: 200,
    headers: {
      "Content-Type": "image/jpeg",
      "Content-Length": String(output.length),
      "Content-Disposition": `attachment; filename="${downloadFilename(photo.filename)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
