import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { studioDisplayName } from "@/lib/studio-name";

export async function GET(
  _req: NextRequest,
  { params }: { params: { linkToken: string } }
) {
  const album = await prisma.album.findUnique({
    where: { linkToken: params.linkToken },
    include: { _count: { select: { photos: true } }, studio: true },
  });
  if (!album) {
    return NextResponse.json({ error: { message: "Không tìm thấy album" } }, { status: 404 });
  }

  const coverPhoto = album.coverPhotoId
    ? await prisma.photo.findFirst({
        where: { id: album.coverPhotoId, albumId: album.id },
        select: { previewUrl: true, originalUrl: true },
      })
    : null;
  if (album.status === "closed") {
    return NextResponse.json(
      { error: { message: "Album này đã đóng, không thể xem." } },
      { status: 403 }
    );
  }
  if (album.expiryDate && album.expiryDate < new Date()) {
    return NextResponse.json(
      { error: { message: "Album đã hết hạn, không thể xem." } },
      { status: 403 }
    );
  }
  const downloadExpired = !!(album.downloadExpiryDate && album.downloadExpiryDate < new Date());
  return NextResponse.json({
    name: album.name,
    description: album.description,
    template: album.template,
    photoCount: album._count.photos,
    requiresPassword: !!album.passwordHash,
    expiryDate: album.expiryDate,
    studioName: studioDisplayName(album.studio),
    coverPhotoId: album.coverPhotoId,
    coverPhotoUrl: coverPhoto?.previewUrl ?? coverPhoto?.originalUrl ?? null,
    coverPosY: album.coverPosY ?? 50,
    eventDate: album.eventDate,
    // Folded together so the client only needs one flag to decide whether
    // to show the Download button at all — password/expiry are only
    // relevant once it's already known to be available.
    downloadEnabled: album.downloadEnabled && !downloadExpired,
    requiresDownloadPassword: !!album.downloadPasswordHash,
  });
}
