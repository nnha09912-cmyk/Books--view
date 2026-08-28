import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getGuestCustomer } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { linkToken: string; photoId: string } }
) {
  const guest = await getGuestCustomer(params.linkToken);
  if (!guest) {
    return NextResponse.json({ error: { message: "Chưa có phiên khách" } }, { status: 401 });
  }
  if (!checkRateLimit(`selection:${guest.id}`, 60, 60 * 1000)) {
    return NextResponse.json(
      { error: { message: "Bạn thao tác quá nhanh, thử lại sau nhé." } },
      { status: 429 }
    );
  }
  const type = req.nextUrl.searchParams.get("type");
  if (type !== "like" && type !== "star") {
    return NextResponse.json(
      { error: { message: "Thiếu tham số type (like|star)" } },
      { status: 400 }
    );
  }

  // Same IDOR guard as the POST handler — params.photoId is client-supplied,
  // so confirm it's actually in this guest's own album before touching it.
  const photo = await prisma.photo.findFirst({
    where: { id: params.photoId, albumId: guest.albumId },
    select: { id: true },
  });
  if (!photo) {
    return NextResponse.json(
      { error: { message: "Không tìm thấy ảnh trong album này" } },
      { status: 404 }
    );
  }

  // Same "album still accepts selection changes" guard as the POST handler.
  const album = await prisma.album.findUnique({
    where: { id: guest.albumId },
    select: { status: true, expiryDate: true },
  });
  if (!album || album.status === "closed") {
    return NextResponse.json(
      { error: { message: "Album này đã đóng, không thể thay đổi lựa chọn." } },
      { status: 403 }
    );
  }
  if (album.expiryDate && album.expiryDate < new Date()) {
    return NextResponse.json(
      { error: { message: "Album đã hết hạn, không thể thay đổi lựa chọn." } },
      { status: 403 }
    );
  }

  const existing = await prisma.selection.findUnique({
    where: {
      customerId_photoId_likeType: {
        customerId: guest.id,
        photoId: params.photoId,
        likeType: type,
      },
    },
  });
  if (!existing) {
    return new NextResponse(null, { status: 204 });
  }

  await prisma.$transaction([
    prisma.selection.delete({ where: { id: existing.id } }),
    prisma.photo.update({
      where: { id: params.photoId },
      data:
        type === "like"
          ? { likeCount: { decrement: 1 } }
          : { starCount: { decrement: 1 } },
    }),
  ]);

  return new NextResponse(null, { status: 204 });
}
