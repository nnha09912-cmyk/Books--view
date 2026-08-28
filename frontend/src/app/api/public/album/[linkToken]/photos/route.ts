import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getGuestCustomer } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: { linkToken: string } }
) {
  const album = await prisma.album.findUnique({
    where: { linkToken: params.linkToken },
    include: { photos: { orderBy: { orderIndex: "asc" } } },
  });
  if (!album) {
    return NextResponse.json({ error: { message: "Không tìm thấy album" } }, { status: 404 });
  }
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

  const guest = await getGuestCustomer(params.linkToken);

  // A password-protected album must not hand out actual photo URLs to
  // anyone who merely has the link — only to a guest who has identified at
  // least once (name+phone, or the album password). Albums with no password
  // keep working exactly as before (public share-link browsing).
  if (album.passwordHash && !guest) {
    return NextResponse.json(
      { error: { message: "Album này yêu cầu xác nhận trước khi xem." } },
      { status: 401 }
    );
  }

  const mySelections = guest
    ? await prisma.selection.findMany({ where: { customerId: guest.id } })
    : [];
  const likedIds = new Set(
    mySelections.filter((s) => s.likeType === "like").map((s) => s.photoId)
  );
  const starredIds = new Set(
    mySelections.filter((s) => s.likeType === "star").map((s) => s.photoId)
  );

  return NextResponse.json({
    data: album.photos.map((p) => ({
      id: p.id,
      filename: p.filename,
      thumbnailUrl: p.thumbnailUrl,
      previewUrl: p.previewUrl,
      originalUrl: p.originalUrl,
      width: p.width,
      height: p.height,
      likeCount: p.likeCount,
      starCount: p.starCount,
      liked: likedIds.has(p.id),
      starred: starredIds.has(p.id),
    })),
  });
}
