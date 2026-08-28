import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getGuestCustomer } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

const bodySchema = z.object({
  text: z.string().trim().min(1, "Nội dung không được để trống").max(1000),
});

async function resolvePhotoAndAlbum(photoId: string, albumId: string) {
  // photoId is client-supplied — confirm it actually belongs to this guest's
  // own album before reading/writing anything (same IDOR guard used by the
  // selections routes).
  const photo = await prisma.photo.findFirst({
    where: { id: photoId, albumId },
    select: { id: true },
  });
  if (!photo) return { photo: null, album: null };

  const album = await prisma.album.findUnique({
    where: { id: albumId },
    select: { status: true, expiryDate: true },
  });
  return { photo, album };
}

export async function GET(
  req: NextRequest,
  { params }: { params: { linkToken: string; photoId: string } }
) {
  const guest = await getGuestCustomer(params.linkToken);
  if (!guest) {
    return NextResponse.json({ error: { message: "Chưa có phiên khách" } }, { status: 401 });
  }

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

  const comments = await prisma.comment.findMany({
    where: { photoId: params.photoId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      text: true,
      createdAt: true,
      customer: { select: { name: true } },
    },
  });

  return NextResponse.json({ comments });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { linkToken: string; photoId: string } }
) {
  const guest = await getGuestCustomer(params.linkToken);
  if (!guest) {
    return NextResponse.json({ error: { message: "Chưa có phiên khách" } }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" } },
      { status: 400 }
    );
  }
  const { text } = parsed.data;

  const { photo, album } = await resolvePhotoAndAlbum(params.photoId, guest.albumId);
  if (!photo) {
    return NextResponse.json(
      { error: { message: "Không tìm thấy ảnh trong album này" } },
      { status: 404 }
    );
  }
  if (!album || album.status === "closed") {
    return NextResponse.json(
      { error: { message: "Album này đã đóng, không thể gửi nhận xét." } },
      { status: 403 }
    );
  }
  if (album.expiryDate && album.expiryDate < new Date()) {
    return NextResponse.json(
      { error: { message: "Album đã hết hạn, không thể gửi nhận xét." } },
      { status: 403 }
    );
  }

  // Anti-spam: keyed by the identified customer (not IP), since only an
  // identified guest can reach this point at all.
  if (!checkRateLimit(`comment:${guest.id}`, 10, 5 * 60 * 1000)) {
    return NextResponse.json(
      { error: { message: "Bạn gửi nhận xét quá nhanh, thử lại sau ít phút nhé." } },
      { status: 429 }
    );
  }

  const comment = await prisma.comment.create({
    data: { photoId: params.photoId, customerId: guest.id, text },
    select: { id: true, text: true, createdAt: true },
  });

  return NextResponse.json({ comment }, { status: 201 });
}
