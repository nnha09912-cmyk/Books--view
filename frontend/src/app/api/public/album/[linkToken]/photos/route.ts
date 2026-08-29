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
    data: album.photos.map((p) => {
      // The client never sees the real storage URL (Vercel Blob or Google
      // Drive) — every view goes through the gated image proxy instead, so
      // a copied/bookmarked image link stops working the moment the album
      // closes, expires, or its password changes. See
      // photos/[photoId]/image/route.ts.
      //
      // `v` (the photo's own updatedAt) makes the URL itself change the
      // moment a photo is re-synced/overwritten — old browser/proxy cache
      // entries are simply never requested again under the new URL, instead
      // of silently keeping the stale image around for a full day.
      const proxyUrl = `/api/public/album/${params.linkToken}/photos/${p.id}/image?v=${p.updatedAt.getTime()}`;
      return {
        id: p.id,
        filename: p.filename,
        thumbnailUrl: p.thumbnailUrl ? proxyUrl : null,
        previewUrl: p.previewUrl ? proxyUrl : null,
        originalUrl: proxyUrl,
        width: p.width,
        height: p.height,
        likeCount: p.likeCount,
        starCount: p.starCount,
        liked: likedIds.has(p.id),
        starred: starredIds.has(p.id),
      };
    }),
  });
}
