import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getGuestCustomer } from "@/lib/auth";

const bodySchema = z.object({
  photoId: z.string().min(1),
  type: z.enum(["like", "star"]),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { linkToken: string } }
) {
  const guest = await getGuestCustomer(params.linkToken);
  if (!guest) {
    return NextResponse.json({ error: { message: "Chưa có phiên khách" } }, { status: 401 });
  }
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: "Dữ liệu không hợp lệ" } },
      { status: 400 }
    );
  }
  const { photoId, type } = parsed.data;

  if (type === "star" && !guest.isPrimary) {
    return NextResponse.json(
      { error: { message: "Chỉ Cô dâu & Chú rể mới có thể đánh dấu Sao" } },
      { status: 403 }
    );
  }

  const existing = await prisma.selection.findUnique({
    where: {
      customerId_photoId_likeType: {
        customerId: guest.id,
        photoId,
        likeType: type,
      },
    },
  });
  if (existing) {
    return new NextResponse(null, { status: 204 });
  }

  if (type === "like") {
    const album = await prisma.album.findUnique({
      where: { id: guest.albumId },
      select: { maxSelectionCount: true },
    });
    if (album?.maxSelectionCount) {
      const likedCount = await prisma.selection.count({
        where: { customerId: guest.id, likeType: "like" },
      });
      if (likedCount >= album.maxSelectionCount) {
        return NextResponse.json(
          { error: { message: `Bạn chỉ được chọn tối đa ${album.maxSelectionCount} ảnh` } },
          { status: 403 }
        );
      }
    }
  }

  await prisma.$transaction([
    prisma.selection.create({
      data: { customerId: guest.id, photoId, likeType: type },
    }),
    prisma.photo.update({
      where: { id: photoId },
      data:
        type === "like"
          ? { likeCount: { increment: 1 } }
          : { starCount: { increment: 1 } },
    }),
  ]);

  return NextResponse.json({ success: true }, { status: 201 });
}
