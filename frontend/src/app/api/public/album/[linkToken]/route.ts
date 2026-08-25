import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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
  if (album.status === "closed") {
    return NextResponse.json(
      { error: { message: "Album này đã đóng, không thể xem." } },
      { status: 403 }
    );
  }
  return NextResponse.json({
    name: album.name,
    description: album.description,
    template: album.template,
    photoCount: album._count.photos,
    requiresPassword: !!album.passwordHash,
    expiryDate: album.expiryDate,
    studioName: album.studio.name,
  });
}
