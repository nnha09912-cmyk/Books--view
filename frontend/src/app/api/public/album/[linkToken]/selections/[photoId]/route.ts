import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getGuestCustomer } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { linkToken: string; photoId: string } }
) {
  const guest = await getGuestCustomer(params.linkToken);
  if (!guest) {
    return NextResponse.json({ error: { message: "Chưa có phiên khách" } }, { status: 401 });
  }
  const type = req.nextUrl.searchParams.get("type");
  if (type !== "like" && type !== "star") {
    return NextResponse.json(
      { error: { message: "Thiếu tham số type (like|star)" } },
      { status: 400 }
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
